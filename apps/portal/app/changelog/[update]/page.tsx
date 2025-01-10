import { getSlug } from '@/lib/slug';
import { getUserName } from '@repo/backend/auth/format';
import { getMembers } from '@repo/backend/auth/utils';
import { database, getJsonColumnFromTable } from '@repo/backend/database';
import { Prose } from '@repo/design-system/components/prose';
import { cn } from '@repo/design-system/lib/utils';
import type { JSONContent } from '@repo/editor';
import { contentToText } from '@repo/editor/lib/tiptap';
import { formatDate } from '@repo/lib/format';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

type UpdateProperties = {
  readonly params: Promise<{
    readonly update: string;
  }>;
};

const Editor = dynamic(async () => {
  const component = await import(
    /* webpackChunkName: "editor" */
    '@repo/editor'
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
      status: 'PUBLISHED',
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
    'changelog',
    'content',
    update.id
  );
  const image = content
    ? (content as JSONContent).content?.find((node) => node.type === 'image')
    : undefined;

  return createMetadata({
    title: update.title,
    description: content ? contentToText(content) : '',
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
        status: 'PUBLISHED',
      },
      orderBy: {
        publishAt: 'desc',
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
      return 'Unknown';
    }

    return getUserName(member);
  };

  const content = await getJsonColumnFromTable(
    'changelog',
    'content',
    update.id
  );

  return (
    <div className="grid divide-y">
      <div className="grid grid-cols-12 gap-8 py-8 md:py-16">
        <div className="col-span-12 md:col-span-3">
          <p className="font-medium text-foreground text-sm">
            {formatDate(update.publishAt)}
          </p>
        </div>
        <div className="col-span-12 md:col-span-9">
          <div className="flex flex-wrap gap-2">
            {update.tags.map((tag) => (
              <div
                key={tag.name}
                className={cn(
                  'rounded bg-card px-2 py-1 font-medium text-foreground text-xs'
                )}
              >
                {tag.name}
              </div>
            ))}
          </div>
          <Prose className="prose-img:pointer-events-none mt-4">
            <h2 className="font-semibold text-3xl">{update.title}</h2>
            <Editor
              defaultValue={content as JSONContent | undefined}
              editable={false}
            />

            <p className="mt-4 text-muted-foreground text-sm">
              Published by {getOwner(update.creatorId)}
            </p>
          </Prose>
        </div>
      </div>
    </div>
  );
};

export default Update;
