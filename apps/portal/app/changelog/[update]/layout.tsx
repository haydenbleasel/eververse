import { database } from "@repo/backend/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getSlug } from "@/lib/slug";
import { ChangelogLink } from "./components/changelog-link";

export const metadata: Metadata = {
  title: "Changelog",
  description: "The latest updates and changes to Eververse",
};

type UpdateLayoutProps = {
  children: ReactNode;
};

const UpdateLayout = async ({ children }: UpdateLayoutProps) => {
  const slug = await getSlug();

  if (!slug) {
    notFound();
  }

  const portal = await database.portal.findFirst({
    where: { slug },
    select: { organizationId: true },
  });

  if (!portal) {
    notFound();
  }

  const changelogs = await database.changelog.findMany({
    where: {
      organizationId: portal.organizationId,
      status: "PUBLISHED",
      publishAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishAt: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });

  return (
    <div className="grid grid-cols-[200px_1fr]">
      <div className="flex flex-col gap-2">
        {changelogs.map((update) => (
          <ChangelogLink id={update.id} key={update.id}>
            {update.title}
          </ChangelogLink>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default UpdateLayout;
