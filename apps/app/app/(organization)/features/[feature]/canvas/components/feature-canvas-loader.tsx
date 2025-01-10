'use client';

import { updateFeature } from '@/actions/feature/update';
import { CanvasSkeleton } from '@/components/skeletons/canvas';
import type { CanvasState } from '@repo/canvas';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Canvas = dynamic(
  async () => {
    const component = await import(
      /* webpackChunkName: "canvas" */
      '@repo/canvas'
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
      theme={theme as 'dark' | 'light' | undefined}
      onSave={handleSave}
      defaultValue={defaultValue}
      editable={editable}
    />
  );
};
