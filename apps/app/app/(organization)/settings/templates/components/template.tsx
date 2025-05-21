import { Template } from '@/app/(organization)/features/[feature]/(notes)/components/template';
import { database } from '@/lib/database';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { Template as TemplateClass } from '@repo/backend/prisma/client';
import { TemplateSettings } from './template-settings';

type TemplateComponentProperties = {
  readonly id: TemplateClass['id'];
};

export const TemplateComponent = async ({
  id,
}: TemplateComponentProperties) => {
  const template = await database.template.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  if (!template) {
    return null;
  }

  const content = await getJsonColumnFromTable(
    'template',
    'content',
    template.id
  );

  return (
    <Template
      active={false}
      id={template.id}
      title={template.title}
      description={template.description}
      content={content}
    >
      <TemplateSettings
        templateId={template.id}
        defaultTitle={template.title}
        defaultDescription={template.description}
      />
    </Template>
  );
};
