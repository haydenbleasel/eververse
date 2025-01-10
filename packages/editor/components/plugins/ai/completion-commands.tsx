import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@repo/design-system/components/ui/command';
import { Check, TextQuote, TrashIcon } from 'lucide-react';
import { useEditor } from 'novel';

export const AICompletionCommands = ({
  completion,
  onDiscard,
}: {
  readonly completion: string;
  readonly onDiscard: () => void;
}) => {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  const handleReplace = () => {
    const { selection } = editor.view.state;

    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .insertContentAt(
        {
          from: selection.from,
          to: selection.to,
        },
        completion
      )
      .run();
  };

  const handleInsert = () => {
    const { selection } = editor.view.state;
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .insertContentAt(selection.to + 1, completion)
      .run();
  };

  return (
    <>
      <CommandGroup>
        <CommandItem
          className="gap-2 px-4"
          value="replace"
          onSelect={handleReplace}
        >
          <Check className="h-4 w-4 text-muted-foreground" />
          Replace selection
        </CommandItem>
        <CommandItem
          className="gap-2 px-4"
          value="insert"
          onSelect={handleInsert}
        >
          <TextQuote className="h-4 w-4 text-muted-foreground" />
          Insert below
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />

      <CommandGroup>
        <CommandItem onSelect={onDiscard} value="thrash" className="gap-2 px-4">
          <TrashIcon className="h-4 w-4 text-muted-foreground" />
          Discard
        </CommandItem>
      </CommandGroup>
    </>
  );
};
