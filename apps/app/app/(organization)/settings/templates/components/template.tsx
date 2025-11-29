import { getJsonColumnFromTable } from "@repo/backend/database";
import type { Template as TemplateClass } from "@repo/backend/prisma/client";
import { Template } from "@/app/(organization)/features/[feature]/(notes)/components/template";
import { database } from "@/lib/database";
import { TemplateSettings } from "./template-settings";

type TemplateComponentProperties = {
  readonly id: TemplateClass["id"];
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
    "template",
    "content",
    template.id
  );

  return (
    <Template
      active={false}
      content={content}
      description={template.description}
      id={template.id}
      title={template.title}
    >
      <TemplateSettings
        defaultDescription={template.description}
        defaultTitle={template.title}
        templateId={template.id}
      />
    </Template>
  );
};
