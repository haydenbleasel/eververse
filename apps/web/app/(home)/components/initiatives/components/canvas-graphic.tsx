"use client";

import dynamic from "next/dynamic";

const Canvas = dynamic(
  async () => {
    const component = await import(
      /* webpackChunkName: "canvas" */
      "@repo/canvas"
    );

    return component.Canvas;
  },
  { ssr: false }
);

export const CanvasGraphic = () => (
  <Canvas autoFocus={false} editable theme="dark" />
);
