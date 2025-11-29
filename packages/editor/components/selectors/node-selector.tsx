import { Button } from "@repo/design-system/components/ui/button";
import {
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  CheckSquare,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  TextIcon,
  TextQuote,
} from "lucide-react";
import { EditorBubbleItem, type EditorInstance, useEditor } from "novel";
import { Popover } from "radix-ui";

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (editor: EditorInstance) => void;
  isActive: (editor: EditorInstance) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) =>
      editor?.chain().focus().toggleNode("paragraph", "paragraph").run(),
    // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
    isActive: (editor) =>
      (editor &&
        !editor.isActive("paragraph") &&
        !editor.isActive("bulletList") &&
        !editor.isActive("orderedList")) ??
      false,
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor) =>
      editor
        ?.chain()
        .focus()
        // @ts-expect-error Need to replace Novel with real extensions
        .toggleHeading({ level: 1 })
        .run(),
    isActive: (editor) => editor?.isActive("heading", { level: 1 }) ?? false,
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor) =>
      editor
        ?.chain()
        .focus()
        // @ts-expect-error Need to replace Novel with real extensions
        .toggleHeading({ level: 2 })
        .run(),
    isActive: (editor) => editor?.isActive("heading", { level: 2 }) ?? false,
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor) =>
      editor
        ?.chain()
        .focus()
        // @ts-expect-error Need to replace Novel with real extensions
        .toggleHeading({ level: 3 })
        .run(),
    isActive: (editor) => editor?.isActive("heading", { level: 3 }) ?? false,
  },
  {
    name: "To-do List",
    icon: CheckSquare,
    command: (editor) => editor?.chain().focus().toggleTaskList().run(),
    isActive: (editor) => editor?.isActive("taskItem") ?? false,
  },
  {
    name: "Bullet List",
    icon: ListOrdered,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor?.isActive("bulletList") ?? false,
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor?.isActive("orderedList") ?? false,
  },
  {
    name: "Quote",
    icon: TextQuote,
    command: (editor) =>
      editor
        ?.chain()
        .focus()
        .toggleNode("paragraph", "paragraph")
        // @ts-expect-error Need to replace Novel with real extensions
        .toggleBlockquote()
        .run(),
    isActive: (editor) => editor?.isActive("blockquote") ?? false,
  },
  {
    name: "Code",
    icon: Code,
    // @ts-expect-error Need to replace Novel with real extensions
    command: (editor) => editor?.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor?.isActive("codeBlock") ?? false,
  },
];
type NodeSelectorProperties = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const NodeSelector = ({
  open,
  onOpenChange,
}: NodeSelectorProperties) => {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Text",
  };

  return (
    <Popover.Root modal onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button className="gap-2 rounded-none border-none" variant="ghost">
          <span className="whitespace-nowrap text-sm">{activeItem.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1" sideOffset={5}>
        {items.map((item) => (
          <EditorBubbleItem
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-card"
            key={item.name}
            onSelect={(onSelectEditor) => {
              item.command(onSelectEditor);
              onOpenChange(false);
            }}
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm bg-background p-1">
                <item.icon className="h-3 w-3" />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check className="h-4 w-4" />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover.Root>
  );
};
