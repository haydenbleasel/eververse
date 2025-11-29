"use client";

import type { CanvasState } from "@repo/canvas";
import { handleError } from "@repo/design-system/lib/handle-error";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { updateFeature } from "@/actions/feature/update";
import { CanvasSkeleton } from "@/components/skeletons/canvas";

const Canvas = dynamic(
  async () => {
    const component = await import(
      /* webpackChunkName: "canvas" */
      "@repo/canvas"
    );

    return component.Canvas;
  },
  { ssr: false, loading: () => <CanvasSkeleton /> }
);

type FeatureCanvasLoaderProperties = {
  readonly featureId: string;
  readonly defaultValue: CanvasState | undefined;
  readonly editable?: boolean;
};

export const FeatureCanvasLoader = ({
  featureId,
  defaultValue,
  editable = false,
}: FeatureCanvasLoaderProperties) => {
  const { theme } = useTheme();

  const handleSave = async (snapshot: CanvasState) => {
    try {
      await updateFeature(featureId, {
        canvas: snapshot,
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
