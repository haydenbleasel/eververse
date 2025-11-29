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
      content: [{ text: "Overview", type: "text" }],
    },
    {
      type: "paragraph",
      content: [
        { text: "The purpose of this feature is to ", type: "text" },
        { text: "enhance", type: "text", marks: [{ type: "bold" }] },
        { text: " the user onboarding experience by providing ", type: "text" },
        { text: "interactive", type: "text", marks: [{ type: "italic" }] },
        {
          text: " walkthroughs. These walkthroughs will guide new users through the key functionalities of our product, using a combination:",
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
          text: "The feature aims to improve user engagement, reduce the learning curve, and increase the overall satisfaction and retention rates of new users.",
          type: "text",
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              text: "This would be insanely helpful for us on Sales. — Mark",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ text: "Tasks", type: "text" }],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: false },
          text: "Get designs done for new onboarding process ",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "Get designs done for new onboarding process ",
                  type: "text",
                },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [
                { text: "Figure out highest points of friction", type: "text" },
              ],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [{ text: "Create benchmark metrics", type: "text" }],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ text: "Developer Notes", type: "text" }],
    },
    {
      type: "paragraph",
      content: [
        { text: "Frontend team", type: "text", marks: [{ type: "bold" }] },
        {
          text: " - the Middleware team have created the following endpoint to track goal completions:",
          type: "text",
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: null },
      content: [
        {
          text: "async function updateGoal() {\n  await fetch('/api/goals', {\n    body: JSON.stringify({\n      type: 'invite',\n      count: 3,\n    })\n  });\n}",
          type: "text",
        },
      ],
    },
  ],
};

export const EditorGraphic = () => {
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
