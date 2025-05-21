'use client';

import { updateChangelog } from '@/actions/changelog/update';
import { staticify } from '@/lib/staticify';
import type { Changelog } from '@repo/backend/prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';
import type { EditorInstance, JSONContent } from '@repo/editor';
import dynamic from 'next/dynamic';

type ChangelogEditorProperties = {
  readonly defaultValue: JSONContent;
  readonly changelogId: Changelog['id'];
  readonly editable: boolean;
  readonly subscribed: boolean;
};

const Editor = dynamic(
  async () => {
    const Module = await import(
      /* webpackChunkName: "editor" */
      '@/components/editor'
    );

    return Module.Editor;
  },
  {
    ssr: false,
  }
);

export const ChangelogEditor = ({
  defaultValue,
  changelogId,
  editable,
  subscribed,
}: ChangelogEditorProperties) => {
  const handleDebouncedUpdate = async (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    const json = editor.getJSON();
    const content = staticify(json);

    try {
      await updateChangelog(changelogId, {
        content,
      });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Editor
      defaultValue={defaultValue}
      onDebouncedUpdate={handleDebouncedUpdate}
      editable={editable}
    />
  );
};
