import { useCompletion } from "@ai-sdk/react";
import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { Prose } from "@repo/design-system/components/prose";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
} from "@repo/design-system/components/ui/command";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import { handleError } from "@repo/design-system/lib/handle-error";
import { ArrowUp } from "lucide-react";
import { useEditor } from "novel";
import { getPrevText } from "novel/utils";
import { useState } from "react";
import Markdown from "react-markdown";
import { AICompletionCommands } from "./completion-commands";
import { AISelectorCommands } from "./selector-commands";

type AiSelectorProperties = {
  readonly onOpenChange: (open: boolean) => void;
};

export const AISelector = ({ onOpenChange }: AiSelectorProperties) => {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/editor/generate",
    onError: handleError,
  });

  const hasCompletion = completion.length > 0;

  if (!editor) {
    return null;
  }

  const handleAppend = async () => {
    const pos = editor.state.selection.from;
    const context = getPrevText(editor, pos);
    const slice = editor.state.selection.content();
    const text = editor.storage.markdown.serializer.serialize(
      slice.content
    ) as string;
    const selection = completion === "" ? text : completion;

    await complete(
      [
        `Here is the selected text: ${selection}`,
        `Here are the last 5000 characters for context: ${context}`,
      ].join("\n"),
      {
        body: { option: "zap", command: inputValue },
      }
    );
    setInputValue("");
  };

  return (
    <Command className="w-[350px]">
      {hasCompletion ? (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <Prose className="prose-sm px-4 py-2">
              <Markdown>{completion}</Markdown>
            </Prose>
          </ScrollArea>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex h-12 w-full items-center justify-center">
          <LoadingCircle />
        </div>
      ) : (
        <>
          <div className="relative">
            <CommandInput
              autoFocus
              onFocus={() => {
                editor.chain().setHighlight({ color: "#c1ecf970" }).run();
              }}
              onValueChange={setInputValue}
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next"
                  : "Ask AI to edit or generate..."
              }
              value={inputValue}
            />
            <Button
              className="-translate-y-1/2 absolute top-1/2 right-2 h-6 w-6 bg-violet-500 dark:bg-violet-400"
              onClick={handleAppend}
              size="icon"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
          </div>
          <CommandList>
            {hasCompletion ? (
              <AICompletionCommands
                completion={completion}
                onDiscard={() => {
                  onOpenChange(false);
                }}
              />
            ) : (
              <AISelectorCommands
                onSelect={async (value, option) =>
                  complete(value, { body: { option } })
                }
              />
            )}
          </CommandList>
        </>
      )}
    </Command>
  );
};
