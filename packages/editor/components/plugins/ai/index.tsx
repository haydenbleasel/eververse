import { Button } from "@repo/design-system/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { EditorBubble, useEditor } from "novel";
import type { ReactNode } from "react";
import { AISelector } from "./ai-selector";

type GenerativeMenuSwitchProperties = {
  readonly children: ReactNode;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange,
}: GenerativeMenuSwitchProperties) => {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  return (
    <EditorBubble
      className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
      tippyOptions={{
        appendTo: () => document.body,
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
        },
      }}
    >
      {open ? (
        <AISelector onOpenChange={onOpenChange} />
      ) : (
        <>
          <Button
            className="gap-1 rounded-none text-violet-500 dark:text-violet-400"
            onClick={() => onOpenChange(true)}
            variant="ghost"
          >
            <SparklesIcon className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </>
      )}
    </EditorBubble>
  );
};
