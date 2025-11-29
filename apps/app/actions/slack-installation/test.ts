"use server";
import { faker } from "@faker-js/faker";
import { currentOrganizationId } from "@repo/backend/auth/utils";
import { parseError } from "@repo/lib/src/parse-error";
import { database } from "@/lib/database";

export const testSlackInstallation = async (): Promise<
  | {
      error: string;
    }
  | {
      success: true;
    }
> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error("Unauthorized");
    }

    const slackInstallation = await database.slackInstallation.findFirst({
      where: {
        organizationId,
      },
      select: {
        webhookUrl: true,
      },
    });

    if (!slackInstallation) {
      throw new Error("Slack installation not found");
    }

    const fakeName = faker.company.buzzPhrase();
    const fakeContent = faker.lorem.paragraphs(3);

    const response = await fetch(slackInstallation.webhookUrl, {
      method: "POST",
      body: JSON.stringify({
        text: `[TEST] New feedback on Eververse: *${fakeName}*`,
        blocks: [
          {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  {
                    type: "text",
                    style: { bold: true },
                    text: `[TEST] New feedback on Eververse: ${fakeName}`,
                  },
                  {
                    type: "text",
                    text: `\n${fakeContent}`,
                  },
                ],
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to test Slack integration");
    }

    return {
      success: true,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
