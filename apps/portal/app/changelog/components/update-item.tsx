import type { Changelog, ChangelogTag } from '@prisma/client';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { Link } from '@repo/design-system/components/link';
import { Prose } from '@repo/design-system/components/prose';
import { cn } from '@repo/design-system/lib/utils';
import type { JSONContent } from '@repo/editor';
import { formatDate } from '@repo/lib/format';
import dynamic from 'next/dynamic';

type UpdateItemProps = {
  update: Pick<
    Changelog,
    'id' | 'title' | 'publishAt' | 'creatorId' | 'content'
  > & {
    tags: Pick<ChangelogTag, 'name'>[];
  };
  index: number;
  owner: string;
};

const Editor = dynamic(async () => {
  const component = await import(
    /* webpackChunkName: "editor" */
    '@repo/editor'
  );

  return component.Editor;
});

export const UpdateItem = async ({ update, index, owner }: UpdateItemProps) => {
  const content = await getJsonColumnFromTable(
    'changelog',
    'content',
    update.id
  );

  return (
    <div
      key={update.id}
      className={cn(
        'grid grid-cols-12 gap-8 py-8 md:py-16',
        !index && 'pt-0 md:pt-8'
      )}
    >
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
          <Link href={`/changelog/${update.id}`}>
            <h2 className="font-semibold text-3xl">{update.title}</h2>
          </Link>
          <Editor
            defaultValue={content as JSONContent | undefined}
            editable={false}
          />

          <p className="mt-4 text-muted-foreground text-sm">
            Published by {owner}
          </p>
        </Prose>
      </div>
    </div>
  );
};
