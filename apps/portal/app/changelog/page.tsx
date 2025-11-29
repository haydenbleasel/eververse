import { database } from "@repo/backend/database";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSlug } from "@/lib/slug";

export const metadata: Metadata = {
  title: "Changelog",
  description: "The latest updates and changes to Eververse",
};

const Changelog = async () => {
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

  const latestChangelog = await database.changelog.findFirst({
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
    },
  });

  if (!latestChangelog) {
    return (
      <div className="grid w-full max-w-none items-center justify-center gap-2 rounded-2xl border bg-secondary p-12">
        <h1 className="m-0">No changelogs found</h1>
        <p className="m-0">
          There are no changelogs published for this portal.
        </p>
      </div>
    );
  }

  return redirect(`/changelog/${latestChangelog.id}`);
};

export default Changelog;
