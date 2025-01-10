import { Popover } from '@radix-ui/react-popover';
import { Button } from '@repo/design-system/components/ui/button';
import {
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import {
  BoldIcon,
  Check,
  ChevronDown,
  CodeIcon,
  ItalicIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EditorBubbleItem, useEditor } from 'novel';
import type { EditorInstance } from 'novel';

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (editor: EditorInstance) => void;
  isActive: (editor: EditorInstance) => boolean;
};

const items: SelectorItem[] = [
  {
    name: 'Bold',
    isActive: (editor) => editor?.isActive('bold') ?? false,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleBold().run(),
    icon: BoldIcon,
  },
  {
    name: 'Italic',
    isActive: (editor) => editor?.isActive('italic') ?? false,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleItalic().run(),
    icon: ItalicIcon,
  },
  {
    name: 'Underline',
    isActive: (editor) => editor?.isActive('underline') ?? false,
    command: (editor) => editor?.chain().focus().toggleUnderline().run(),
    icon: UnderlineIcon,
  },
  {
    name: 'Strikethrough',
    isActive: (editor) => editor?.isActive('strike') ?? false,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleStrike().run(),
    icon: StrikethroughIcon,
  },
  {
    name: 'Code',
    isActive: (editor) => editor?.isActive('code') ?? false,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleCode().run(),
    icon: CodeIcon,
  },
  {
    name: 'Superscript',
    isActive: (editor) => editor?.isActive('superscript') ?? false,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleSuperscript().run(),
    icon: SuperscriptIcon,
  },
  {
    name: 'Subscript',
    isActive: (editor) => editor?.isActive('subscript') ?? false,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleSubscript().run(),
    icon: SubscriptIcon,
  },
];

type FormatSelectorProperties = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const FormatSelector = ({
  open,
  onOpenChange,
}: FormatSelectorProperties) => {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  return (
    <Popover modal open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="gap-2 rounded-none border-none">
          <span className="whitespace-nowrap text-sm">Format</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        {items.map((item, index) => (
          <EditorBubbleItem
            key={index}
            onSelect={(onSelectEditor) => {
              item.command(onSelectEditor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-card"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm bg-background p-1">
                <item.icon className="h-3 w-3" />
              </div>
              <span>{item.name}</span>
            </div>
            {item.isActive(editor) ? <Check className="h-4 w-4" /> : null}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
