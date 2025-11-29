import { database, getJsonColumnFromTable } from "@repo/backend/database";
import { Link } from "@repo/design-system/components/link";
import { contentToText } from "@repo/editor/lib/tiptap";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSlug } from "@/lib/slug";
import { VoteButton } from "./components/vote-button";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Vote and track the latest updates and changes to Eververse",
};

const getContent = async (featureId: string) => {
  const content = await getJsonColumnFromTable(
    "portal_feature",
    "content",
    featureId
  );
  return content ? contentToText(content) : null;
};

const Roadmap = async () => {
  const slug = await getSlug();

  if (!slug) {
    notFound();
  }

  const data = await database.portal.findFirst({
    where: { slug },
    select: {
      organization: {
        select: {
          stripeSubscriptionId: true,
        },
      },
      features: {
        select: {
          votes: true,
          id: true,
          title: true,
          feature: {
            select: {
              status: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      statuses: {
        select: {
          id: true,
          name: true,
          color: true,
          order: true,
          portalStatusMappings: {
            select: {
              id: true,
              featureStatus: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!data) {
    notFound();
  }

  return (
    <div className="grid gap-4 md:h-[calc(100dvh-105px-52px-64px)] md:grid-cols-3">
      {data.statuses
        .sort((statusA, statusB) => statusA.order - statusB.order)
        .map((status) => (
          <div
            className="flex flex-col rounded-xl bg-secondary md:h-full md:overflow-hidden"
            key={status.id}
          >
            <div className="flex shrink-0 items-center gap-2 p-4">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: status.color,
                }}
              />
              <p className="m-0 font-medium text-sm">{status.name}</p>
            </div>
            <div className="flex w-full flex-1 flex-col gap-2 p-2 md:h-full md:overflow-y-auto">
              {data.features
                .filter((item) =>
                  status.portalStatusMappings.some(
                    (mapping) =>
                      mapping.featureStatus.id === item.feature.status.id
                  )
                )
                .map((item) => (
                  <div
                    className="flex items-center gap-2 rounded-lg border-b bg-background px-4 py-3 shadow-sm transition-all hover:shadow"
                    key={item.id}
                  >
                    {data.organization.stripeSubscriptionId ? (
                      <VoteButton
                        defaultVotes={item.votes.length}
                        portalFeatureId={item.id}
                        slug={slug}
                      />
                    ) : null}
                    <Link
                      className="block font-normal text-inherit no-underline"
                      href={`/${item.id}`}
                    >
                      <p className="m-0 truncate font-medium text-foreground text-sm">
                        {item.title}
                      </p>
                      <p className="m-0 line-clamp-1 text-muted-foreground text-sm">
                        {getContent(item.id)}
                      </p>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Roadmap;
