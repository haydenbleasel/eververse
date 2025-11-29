import { getUserName } from "@repo/backend/auth/format";
import { getMembers } from "@repo/backend/auth/utils";
import { database, getJsonColumnFromTable } from "@repo/backend/database";
import { Prose } from "@repo/design-system/components/prose";
import type { JSONContent } from "@repo/editor";
import { contentToText } from "@repo/editor/lib/tiptap";
import { formatDate } from "@repo/lib/format";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getSlug } from "@/lib/slug";

type UpdateProperties = {
  readonly params: Promise<{
    readonly update: string;
  }>;
};

const Editor = dynamic(async () => {
  const component = await import(
    /* webpackChunkName: "editor" */
    "@repo/editor"
  );

  return component.Editor;
});

export const generateMetadata = async (
  props: UpdateProperties
): Promise<Metadata> => {
  const params = await props.params;
  const slug = await getSlug();

  if (!slug) {
    return {};
  }

  const portal = await database.portal.findFirst({
    where: { slug },
    select: { organizationId: true },
  });

  if (!portal) {
    return {};
  }

  const update = await database.changelog.findFirst({
    where: {
      id: params.update,
      organizationId: portal.organizationId,
      status: "PUBLISHED",
      publishAt: {
        lte: new Date(),
      },
    },
    select: {
      title: true,
      id: true,
    },
  });

  if (!update) {
    return {};
  }

  const content = await getJsonColumnFromTable(
    "changelog",
    "content",
    update.id
  );
  const image = content
    ? (content as JSONContent).content?.find((node) => node.type === "image")
    : undefined;

  return createMetadata({
    title: update.title,
    description: content ? contentToText(content) : "",
    image: image ? (image.attrs as { src?: string }).src : undefined,
  });
};

const Update = async (props: UpdateProperties) => {
  const params = await props.params;
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

  const [update, members] = await Promise.all([
    database.changelog.findFirst({
      where: {
        id: params.update,
        organizationId: portal.organizationId,
        status: "PUBLISHED",
      },
      orderBy: {
        publishAt: "desc",
      },
      select: {
        id: true,
        title: true,
        publishAt: true,
        tags: {
          select: { name: true },
        },
        creatorId: true,
      },
    }),
    getMembers(portal.organizationId),
  ]);

  if (!update) {
    notFound();
  }

  const getOwner = (creatorId: string) => {
    const member = members.find(({ id }) => id === creatorId);

    if (!member) {
      return "Unknown";
    }

    return getUserName(member);
  };

  const content = await getJsonColumnFromTable(
    "changelog",
    "content",
    update.id
  );

  return (
    <div className="grid grid-cols-[1fr_200px]">
      <Prose className="prose-img:pointer-events-none mx-auto">
        <h1>{update.title}</h1>
        <Editor
          defaultValue={content as JSONContent | undefined}
          editable={false}
        />
      </Prose>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">Published by</p>
          <p className="text-sm">{getOwner(update.creatorId)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">Published on</p>
          <p className="text-sm">{formatDate(update.publishAt)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">Tags</p>
          <ul className="list-disc pl-4 text-sm">
            {update.tags.map((tag) => (
              <li className="text-sm" key={tag.name}>
                {tag.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Update;
