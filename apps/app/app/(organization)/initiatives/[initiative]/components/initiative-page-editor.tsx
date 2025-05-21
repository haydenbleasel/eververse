'use client';

import { updateInitiativePage } from '@/actions/initiative-page/update';
import { staticify } from '@/lib/staticify';
import type { InitiativePage } from '@repo/backend/prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';
import type { EditorInstance, JSONContent } from '@repo/editor';
import dynamic from 'next/dynamic';

type InitiativePageEditorProperties = {
  readonly defaultValue: JSONContent;
  readonly pageId: InitiativePage['id'];
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

export const InitiativePageEditor = ({
  defaultValue,
  pageId,
  editable,
  subscribed,
}: InitiativePageEditorProperties) => {
  const handleDebouncedUpdate = async (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    const json = editor.getJSON();
    const content = staticify(json);

    try {
      await updateInitiativePage(pageId, { content });
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
