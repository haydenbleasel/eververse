import { Select } from '@repo/design-system/components/precomposed/select';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useConnectForm } from '../use-connect-form';
import { connectToJira } from './connect-to-jira';
import { createJiraIssue } from './create-jira-issue';
import { getJiraProjects } from './get-jira-projects';
import type { GetJiraProjectsResponse } from './get-jira-projects';
import { getJiraTypes } from './get-jira-types';
import type { GetJiraTypesResponse } from './get-jira-types';

export const JiraIssueCreator = () => {
  const { hide, featureId } = useConnectForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<GetJiraProjectsResponse['projects']>(
    []
  );
  const [types, setTypes] = useState<GetJiraTypesResponse['types']>([]);
  const [project, setProject] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [projectsFetched, setProjectsFetched] = useState(false);
  const [typesFetched, setTypesFetched] = useState(false);

  useEffect(() => {
    if (projectsFetched || loading) {
      return;
    }

    setLoading(true);

    getJiraProjects()
      .then((response) => {
        if ('error' in response) {
          throw new Error(response.error);
        }

        return response.projects;
      })
      .then(setProjects)
      .catch(handleError)
      .finally(() => {
        setLoading(false);
        setProjectsFetched(true);
        setTypesFetched(false);
      });
  }, [loading, projectsFetched]);

  useEffect(() => {
    if (!project || typesFetched || loading) {
      return;
    }

    setLoading(true);

    getJiraTypes(project)
      .then((response) => {
        if ('error' in response) {
          throw new Error(response.error);
        }

        return response.types;
      })
      .then(setTypes)
      .catch(handleError)
      .finally(() => {
        setLoading(false);
        setTypesFetched(true);
      });
  }, [loading, project, typesFetched]);

  const handleCreateJiraIssue = async () => {
    if (loading || !featureId || !project || !type) {
      return;
    }

    setLoading(true);

    try {
      const issueResponse = await createJiraIssue({
        projectId: project,
        typeId: type,
        featureId,
      });

      if (issueResponse.error) {
        throw new Error(issueResponse.error);
      }

      if (!issueResponse.id || !issueResponse.href) {
        throw new Error('Issue not found');
      }

      const { error } = await connectToJira({
        featureId,
        externalId: issueResponse.id,
        href: issueResponse.href,
      });

      if (error) {
        throw new Error(error);
      }

      hide();

      window.open(issueResponse.href, '_blank');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        label="Select a project"
        value={project}
        onChange={setProject}
        disabled={projects.length === 0}
        data={projects.map((projectItem) => ({
          value: `${projectItem.id}`,
          label: projectItem.title,
        }))}
        renderItem={(item) => {
          const projectItem = projects.find(
            ({ id }) => id === Number(item.value)
          );

          if (!projectItem) {
            return null;
          }

          return (
            <div className="flex items-center gap-2">
              <Image
                src={projectItem.image}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 object-fit"
                unoptimized
              />
              <span>{item.label}</span>
              <span className="text-muted-foreground text-xs">
                {projectItem.key}
              </span>
            </div>
          );
        }}
        type="project"
      />
      <Select
        label="Select a type"
        value={type}
        onChange={setType}
        disabled={!project || types.length === 0}
        data={types.map((typeItem) => ({
          value: typeItem.id,
          label: typeItem.title,
        }))}
        renderItem={(item) => {
          const typeItem = types.find(({ id }) => id === item.value);

          if (!typeItem) {
            return null;
          }

          return (
            <div className="flex items-center gap-2">
              <Image
                src={typeItem.image}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 object-fit"
                unoptimized
              />
              <span>{item.label}</span>
            </div>
          );
        }}
        type="type"
      />
      <Button
        variant="secondary"
        onClick={handleCreateJiraIssue}
        disabled={loading}
        className="shrink-0"
      >
        Create new issue
      </Button>
    </div>
  );
};
