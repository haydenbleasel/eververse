"use client";

import "./styles/canvas.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type {
  BinaryFiles,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types/types";
import { useDebouncedCallback } from "@react-hookz/web";
import deepEqual from "deep-equal";
import { useRef } from "react";
import { CanvasBackground } from "./components/background";

export type CanvasState = {
  readonly elements: readonly ExcalidrawElement[];
  readonly files: BinaryFiles;
};

type CanvasProperties = {
  readonly theme: "dark" | "light" | undefined;
  readonly onSave?: (state: CanvasState) => void;
  readonly defaultValue?: object;
  readonly autoFocus?: boolean;
  readonly editable?: boolean;
};

export const Canvas = ({
  theme,
  defaultValue,
  onSave,
  autoFocus = true,
  editable = false,
}: CanvasProperties) => {
  const lastSnapshot = useRef<CanvasState | null>(null);

  const handleChange: ExcalidrawProps["onChange"] = (
    elements,
    _appState,
    files
  ) => {
    const newSnapshot = structuredClone({ elements, files });
    const isSame = deepEqual(lastSnapshot.current, newSnapshot);

    if (!isSame) {
      onSave?.(newSnapshot);
      lastSnapshot.current = structuredClone(newSnapshot);
    }
  };

  const debouncedHandleChange = useDebouncedCallback(handleChange, [], 500);

  return (
    <div className="not-prose relative flex flex-1 bg-background">
      <CanvasBackground />
      <Excalidraw
        autoFocus={autoFocus}
        initialData={{
          ...defaultValue,
          appState: {
            viewBackgroundColor: "transparent",
          },
        }}
        onChange={debouncedHandleChange}
        theme={theme}
        UIOptions={{
          canvasActions: {
            toggleTheme: false,
            loadScene: false,
          },
        }}
        viewModeEnabled={!editable}
        zenModeEnabled
      />
    </div>
  );
};

export const CanvasBeta = ({
  theme,
  defaultValue,
  onSave,
  autoFocus = true,
  editable = false,
}: CanvasProperties) => {
  const lastSnapshot = useRef<CanvasState | null>(null);
  const handleChange: ExcalidrawProps["onChange"] = (
    elements,
    _appState,
    files
  ) => {
    const newSnapshot = structuredClone({ elements, files });
    const isSame = deepEqual(lastSnapshot.current, newSnapshot);

    if (!isSame) {
      onSave?.(newSnapshot);
      lastSnapshot.current = structuredClone(newSnapshot);
    }
  };

  const debouncedHandleChange = useDebouncedCallback(handleChange, [], 500);

  return (
    <div className="not-prose relative flex flex-1 bg-background">
      <CanvasBackground />
      <Excalidraw
        autoFocus={autoFocus}
        initialData={{
          ...defaultValue,
          appState: {
            viewBackgroundColor: "transparent",
          },
        }}
        onChange={debouncedHandleChange}
        theme={theme}
        UIOptions={{
          canvasActions: {
            toggleTheme: false,
            loadScene: false,
          },
        }}
        viewModeEnabled={!editable}
      />
    </div>
  );
};
