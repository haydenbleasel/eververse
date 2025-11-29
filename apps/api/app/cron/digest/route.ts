import { database } from "@repo/backend/database";
import type { Prisma } from "@repo/backend/prisma/client";
import { log } from "@repo/observability/log";
import { generateText } from "ai";
import { subDays } from "date-fns";
import { NextResponse } from "next/server";

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const GET = async (): Promise<Response> => {
  log.info("🤖 Looking for organizations to create digests for...");

  const yesterday = subDays(new Date(), 1);
  const where = {
    createdAt: {
      gte: yesterday,
    },
  };

  const organizations = await database.organization.findMany({
    where: {
      stripeSubscriptionId: { not: null },
      digests: {
        none: where,
      },
    },
    take: 10,
    select: {
      id: true,
      feedback: {
        where,
        select: {
          title: true,
          feedbackUser: {
            select: {
              name: true,
              feedbackOrganization: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      features: {
        where,
        select: {
          title: true,
          product: {
            select: {
              name: true,
            },
          },
          group: {
            select: {
              name: true,
            },
          },
        },
      },
      changelog: {
        where,
        select: {
          title: true,
        },
      },
      initiatives: {
        where,
        select: {
          title: true,
        },
      },
      initiativePages: {
        where,
        select: {
          title: true,
        },
      },
      initiativeCanvases: {
        where,
        select: {
          title: true,
        },
      },
      portalFeatureVotes: {
        where,
        select: {
          portalFeature: {
            select: {
              title: true,
            },
          },
          feedbackUser: {
            select: {
              name: true,
              feedbackOrganization: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      releases: {
        where: {
          endAt: {
            gte: new Date(),
          },
        },
        take: 1,
        orderBy: {
          endAt: "asc",
        },
        select: {
          title: true,
        },
      },
    },
  });

  if (!organizations.length) {
    log.error("📰 No organizations found.");
    return NextResponse.json(
      { message: "No organizations found." },
      { status: 200 }
    );
  }

  log.info(
    `🤖 Found ${organizations.length} organizations, creating digests...`
  );

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  for (const organization of organizations) {
    const prompt = [
      "Feedback created:",
      JSON.stringify(organization.feedback),
      "------",
      "Features created:",
      JSON.stringify(organization.features),
      "------",
      "Changelogs created:",
      JSON.stringify(organization.changelog),
      "------",
      "Next release:",
      JSON.stringify(organization.releases),
    ].join("\n");

    const [text, summary] = await Promise.all([
      generateText({
        model: "openai/gpt-4o-mini",
        system: [
          "You are an AI that creates a digest of the most important things that happened in the last 24 hours.",
          "Be as comprehensive as possible.",
          "Use markdown formatting to highlight important parts of the digest.",
        ].join("\n"),
        prompt,
      }),
      generateText({
        model: "openai/gpt-4o-mini",
        system: [
          "You are an AI that creates a digest of the most important things that happened in the last 24 hours.",
          "You have maximum 2000 characters to describe the digest.",
          "Do not include any markdown formatting.",
        ].join("\n"),
        prompt,
      }),
    ]);

    const transaction = database.digest.create({
      data: {
        text: text.text,
        organizationId: organization.id,
        summary: summary.text,
      },
    });

    transactions.push(transaction);
  }

  await Promise.all(transactions);

  return new Response("OK", { status: 200 });
};
