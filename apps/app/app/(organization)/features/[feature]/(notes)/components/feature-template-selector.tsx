'use client';

import { updateFeatureFromTemplate } from '@/actions/feature/update';
import { OrDivider } from '@/components/or-divider';
import type { Feature } from '@prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import atlassianTemplate from '@repo/editor/templates/atlassian.json';
import loomTemplate from '@repo/editor/templates/loom.json';
import notionTemplate from '@repo/editor/templates/notion.json';
import { useState } from 'react';
import { Template } from './template';
import type { TemplateProperties } from './template';

type FeatureTemplateSelectorProperties = {
  readonly featureId: Feature['id'];
  readonly templates: TemplateProperties[];
};

const defaultTemplates: TemplateProperties[] = [
  {
    id: 'atlassian',
    title: 'Atlassian',
    description: "Atlassian's PRD template.",
    content: atlassianTemplate,
  },
  {
    id: 'notion',
    title: 'Notion',
    description: "Notion's PRD template.",
    content: notionTemplate,
  },
  {
    id: 'loom',
    title: 'Loom',
    description: "Loom's PRD template.",
    content: loomTemplate,
  },
];

export const FeatureTemplateSelector = ({
  featureId,
  templates,
}: FeatureTemplateSelectorProperties) => {
  const [loading, setLoading] = useState(false);

  const handleCreateVersion = async (templateId: string | null) => {
    setLoading(true);

    try {
      const response = await updateFeatureFromTemplate(featureId, templateId);

      if ('error' in response) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-8',
        loading && 'pointer-events-none select-none opacity-50'
      )}
    >
      <div className="grid w-full grid-cols-3 gap-2">
        {[...templates, ...defaultTemplates].map((template) => (
          <button
            type="button"
            key={template.id}
            onClick={async () => handleCreateVersion(template.id)}
            className="shrink-0 text-left"
          >
            <Template {...template} active={template.id === ''} />
          </button>
        ))}
      </div>
      <OrDivider />
      <Button
        variant="outline"
        className="w-full"
        onClick={async () => handleCreateVersion(null)}
      >
        Start from scratch
      </Button>
    </div>
  );
};
