"use client";

import type { InitiativeCanvas } from "@repo/backend/prisma/client";
import type { CanvasState } from "@repo/canvas";
import { handleError } from "@repo/design-system/lib/handle-error";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { updateInitiativeCanvas } from "@/actions/initiative-canvas/update";
import { CanvasSkeleton } from "@/components/skeletons/canvas";

type InitiativeCanvasLoaderProperties = {
  readonly initiativeCanvasId: InitiativeCanvas["id"];
  readonly defaultValue: CanvasState | undefined;
  readonly editable?: boolean;
};

const Canvas = dynamic(
  async () => {
    const component = await import(
      /* webpackChunkName: "canvas" */
      "@repo/canvas"
    );

    return component.Canvas;
  },
  {
    ssr: false,
    loading: () => <CanvasSkeleton />,
  }
);

export const InitiativeCanvasLoader = ({
  initiativeCanvasId,
  defaultValue,
  editable = false,
}: InitiativeCanvasLoaderProperties) => {
  const { theme } = useTheme();

  const handleSave = async (snapshot: CanvasState) => {
    try {
      await updateInitiativeCanvas(initiativeCanvasId, {
        content: snapshot,
      });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Canvas
      defaultValue={defaultValue}
      editable={editable}
      onSave={handleSave}
      theme={theme as "dark" | "light" | undefined}
    />
  );
};
