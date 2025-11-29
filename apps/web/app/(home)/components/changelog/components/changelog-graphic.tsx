"use client";

import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";

const Editor = dynamic(
  async () => {
    const component = await import(
      /* webpackChunkName: "editor" */
      "@repo/editor"
    );

    return component.Editor;
  },
  { ssr: false }
);

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ text: "Release 6.0", type: "text" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text: "In this release, we are introducing a new onboarding process for new users. The new onboarding process will include ",
          type: "text",
        },
      ],
    },
    {
      type: "bulletList",
      attrs: { tight: true },
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ text: "visual cues", type: "text" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ text: "step-by-step instructions", type: "text" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ text: "interactive elements.", type: "text" }],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text: "We believe that this new onboarding process will help new users get up to speed with our product faster and more efficiently.",
          type: "text",
        },
      ],
    },
  ],
};

export const ChangelogGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "all" });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="h-full w-full overflow-auto p-6">
      <Editor defaultValue={defaultContent} />
    </div>
  );
};
