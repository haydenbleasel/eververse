import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { JSONContent } from '@repo/editor';
import { contentToText, textToContent } from '@repo/editor/lib/tiptap';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TemplateEditor } from './components/template-editor';
import { TemplateTitle } from './components/template-title';

type TemplatePageProperties = {
  readonly params: Promise<{
    readonly templateId: string;
  }>;
};

export const dynamic = 'force-dynamic';

export const generateMetadata = async (
  props: TemplatePageProperties
): Promise<Metadata> => {
  const params = await props.params;
  const template = await database.template.findUnique({
    where: { id: params.templateId },
    select: {
      title: true,
      id: true,
    },
  });

  if (!template) {
    return {};
  }

  const content = await getJsonColumnFromTable(
    'template',
    'content',
    template.id
  );
  const text = content ? contentToText(content) : '';

  return createMetadata({
    title: template.title,
    description: text.slice(0, 150),
  });
};

const TemplatePage = async (props: TemplatePageProperties) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    notFound();
  }

  const template = await database.template.findUnique({
    where: { id: params.templateId },
    select: {
      title: true,
      id: true,
      organization: {
        select: {
          stripeSubscriptionId: true,
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  let content = await getJsonColumnFromTable(
    'template',
    'content',
    template.id
  );

  if (!content) {
    const newContent = textToContent('');

    await database.template.update({
      where: { id: params.templateId },
      data: { content: newContent },
      select: { id: true },
    });

    content = newContent;
  }

  return (
    <>
      <TemplateTitle
        defaultTitle={template.title}
        templateId={params.templateId}
        editable={user.user_metadata.organization_role !== EververseRole.Member}
      />
      <TemplateEditor
        templateId={params.templateId}
        defaultValue={content as JSONContent}
        editable={user.user_metadata.organization_role !== EververseRole.Member}
        subscribed={Boolean(template.organization.stripeSubscriptionId)}
      />
    </>
  );
};

export default TemplatePage;
