import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@repo/design-system/lib/utils';
import { RemoveFormattingIcon } from 'lucide-react';
import { EditorBubbleItem, useEditor } from 'novel';
import type { SelectorItem } from './node-selector';

export const TextButtons = () => {
  const currentEditor = useEditor();

  if (!currentEditor.editor) {
    return null;
  }

  const items: SelectorItem[] = [
    {
      name: 'clear-formatting',
      isActive: () => false,
      command: (editor) =>
        editor?.chain().focus().clearNodes().unsetAllMarks().run(),
      icon: RemoveFormattingIcon,
    },
  ];

  return (
    <div className="flex">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={(onSelectEditor) => {
            item.command(onSelectEditor);
          }}
        >
          <Button className="rounded-none" variant="ghost" size="icon">
            <item.icon
              className={cn('h-4 w-4', {
                'text-violet-500 dark:text-violet-400': currentEditor.editor
                  ? item.isActive(currentEditor.editor)
                  : false,
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
