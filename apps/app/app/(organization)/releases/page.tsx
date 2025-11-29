import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import { createMetadata } from "@repo/seo/metadata";
import { FlagIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { database } from "@/lib/database";
import { CreateReleaseButton } from "./components/create-release-button";
import { ReleaseItem } from "./components/release-item";

const title = "Releases";
const description = "Create and manage software versions";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Releases = async () => {
  const user = await currentUser();

  if (!user) {
    return notFound();
  }

  const releases = await database.release.findMany({
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      state: true,
      jiraId: true,
    },
    orderBy: [
      {
        startAt: "desc",
      },
      {
        title: "desc",
      },
    ],
  });

  if (
    !releases.length &&
    user.user_metadata.organization_role === EververseRole.Member
  ) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          description="Releases are a way to communicate with your team about changes to your product."
          icon={FlagIcon}
          title="You don't have any releases"
        />
      </div>
    );
  }

  if (!releases.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          description="Releases are a way to communicate with your team about changes to your product."
          icon={FlagIcon}
          title="Create your first release"
        >
          <CreateReleaseButton />
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-2">
            <h1 className="m-0 font-semibold text-4xl tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {user.user_metadata.organization_role !== EververseRole.Member && (
            <CreateReleaseButton />
          )}
        </div>
        <div className="mt-8 divide-y">
          {releases.map((release) => (
            <ReleaseItem key={release.id} release={release} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Releases;
