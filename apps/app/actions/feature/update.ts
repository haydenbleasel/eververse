'use server';

import { database } from '@/lib/database';
import { createClient } from '@repo/atlassian';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type {
  Feature,
  FeatureConnection,
  Template,
} from '@repo/backend/prisma/client';
import { textToContent } from '@repo/editor/lib/tiptap';
import atlassianTemplate from '@repo/editor/templates/atlassian.json';
import loomTemplate from '@repo/editor/templates/loom.json';
import notionTemplate from '@repo/editor/templates/notion.json';
import { createOctokit } from '@repo/github';
import { parseError } from '@repo/lib/parse-error';
import { type Issue, LinearClient } from '@repo/linear';
import { revalidatePath } from 'next/cache';

const updateJira = async (
  connection: FeatureConnection,
  data: Partial<Feature>
) => {
  if (!connection.atlassianInstallationId) {
    throw new Error('Atlassian installation not found');
  }

  const installation = await database.atlassianInstallation.findUnique({
    where: {
      id: connection.atlassianInstallationId,
    },
    select: {
      fieldMappings: true,
      accessToken: true,
      email: true,
      siteUrl: true,
    },
  });

  if (!installation) {
    throw new Error('Atlassian installation not found');
  }

  const fields: Record<string, unknown> = {};

  if (data.title) {
    fields.summary = data.title;
  }

  const startAtMapping = installation.fieldMappings.find(
    (mapping) => mapping.internalId === 'STARTAT'
  );
  const endAtMapping = installation.fieldMappings.find(
    (mapping) => mapping.internalId === 'ENDAT'
  );

  if (data.startAt && startAtMapping) {
    fields[startAtMapping.externalId] = data.startAt
      .toISOString()
      .split('T')[0];
  }

  if (data.endAt && endAtMapping) {
    fields[endAtMapping.externalId] = data.endAt.toISOString().split('T')[0];
  }

  if (!Object.keys(fields).length) {
    return;
  }

  const atlassian = createClient(installation);
  const response = await atlassian.PUT('/rest/api/2/issue/{issueIdOrKey}', {
    params: {
      path: {
        issueIdOrKey: connection.externalId,
      },
    },
    body: {
      fields,
    },
  });

  if (response.error) {
    throw new Error('Failed to update Jira ticket.');
  }
};

const updateGitHub = async (
  connection: FeatureConnection,
  data: Partial<Feature>
) => {
  if (!data.title) {
    return;
  }

  if (!connection.githubInstallationId) {
    throw new Error('GitHub installation not found');
  }

  const octokit = createOctokit(connection.githubInstallationId);

  // Parse repo and owner from https://github.com/[owner]/[repo]/issues/[issue_number]
  const segments = connection.href.split('/');

  if (segments.length !== 7) {
    throw new Error('Invalid GitHub issue URL');
  }

  const owner = segments[3];
  const repo = segments[4];

  const response = await octokit.issues.update({
    issue_number: Number(connection.externalId),
    owner,
    repo,
    title: data.title,
  });

  if (!`${response.status}`.startsWith('2')) {
    throw new Error('Failed to update GitHub issue.');
  }
};

const updateLinear = async (
  connection: FeatureConnection,
  data: Partial<Feature>
) => {
  if (!connection.linearInstallationId) {
    throw new Error('Linear installation not found');
  }

  const installation = await database.linearInstallation.findUnique({
    where: { id: connection.linearInstallationId },
    select: { apiKey: true },
  });

  if (!installation) {
    throw new Error('Linear installation not found');
  }

  const fields: {
    title?: Issue['title'];
    dueDate?: Issue['dueDate'];
  } = {};

  if (data.title) {
    fields.title = data.title;
  }

  if (data.endAt) {
    fields.dueDate = data.endAt.toISOString().split('T')[0];
  }

  if (Object.keys(fields).length === 0) {
    return;
  }

  const linear = new LinearClient({
    apiKey: installation.apiKey,
  });
  const response = await linear.updateIssue(connection.externalId, fields);

  if (!response.success) {
    throw new Error('Failed to update Linear issue.');
  }
};

export const updateFeature = async (
  featureId: Feature['id'],
  data: Omit<Partial<Feature>, 'content' | 'canvas'> & {
    canvas?: object;
    content?: object;
  }
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update features");
    }

    if (data.groupId && !data.productId) {
      const group = await database.group.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      data.productId = group.productId;
    }

    const feature = await database.feature.update({
      where: { id: featureId },
      data,
      select: {
        id: true,
        connection: true,
      },
    });

    if (feature.connection?.linearInstallationId) {
      await updateLinear(feature.connection, data);
    }

    if (feature.connection?.githubInstallationId) {
      await updateGitHub(feature.connection, data);
    }

    if (feature.connection?.atlassianInstallationId) {
      await updateJira(feature.connection, data);
    }

    revalidatePath('/features');
    revalidatePath('/roadmap');
    revalidatePath(`/features/${featureId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};

export const updateFeatureFromTemplate = async (
  featureId: Feature['id'],
  templateId: Template['id'] | null
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update features");
    }

    let content = textToContent('');

    switch (templateId) {
      case 'atlassian': {
        content = atlassianTemplate;

        break;
      }
      case 'notion': {
        content = notionTemplate;

        break;
      }
      case 'loom': {
        content = loomTemplate;

        break;
      }
      default: {
        if (templateId) {
          const template = await database.template.findUnique({
            where: { id: templateId },
            select: {
              id: true,
            },
          });

          if (!template) {
            throw new Error('Template not found.');
          }

          const templateContent = await getJsonColumnFromTable(
            'template',
            'content',
            template.id
          );

          if (templateContent) {
            content = templateContent as object;
          }
        }
      }
    }

    await updateFeature(featureId, { content });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
