import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { parseError } from "@repo/lib/parse-error";
import { log } from "@repo/observability/log";
import type { Rows } from "lucide-react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ColumnsIcon,
  EllipsisIcon,
  EllipsisVerticalIcon,
  RowsIcon,
  TrashIcon,
} from "lucide-react";
import { useEditor } from "novel";
import { useEffect, useState } from "react";

type TableMenuItem = {
  name: string;
  command: () => void;
  icon: typeof Rows;
  className?: string;
};

export const TableMenu = () => {
  const [tableLocation, setTableLocation] = useState(0);
  const [columnMenuPosition, setColumnMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [rowMenuPosition, setRowMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const { editor } = useEditor();

  const columnMenuItems: TableMenuItem[] = [
    {
      name: "Add column before",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().addColumnBefore().run(),
      icon: ArrowLeftIcon,
    },
    {
      name: "Add column after",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().addColumnAfter().run(),
      icon: ArrowRightIcon,
    },
    {
      name: "Delete column",
      command: () => {
        // @ts-expect-error Need to replace Novel with real extensions
        editor?.chain().focus().deleteColumn().run();
      },
      icon: TrashIcon,
      className: "text-destructive",
    },
  ];

  const rowMenuItems: TableMenuItem[] = [
    {
      name: "Add row before",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().addRowBefore().run(),
      icon: ArrowUpIcon,
    },
    {
      name: "Add row after",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().addRowAfter().run(),
      icon: ArrowDownIcon,
    },
    {
      name: "Delete row",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().deleteRow().run(),
      icon: TrashIcon,
      className: "text-destructive",
    },
  ];

  const globalMenuItems: TableMenuItem[] = [
    {
      name: "Toggle header column",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().toggleHeaderColumn().run(),
      icon: ColumnsIcon,
    },
    {
      name: "Toggle header row",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().toggleHeaderRow().run(),
      icon: RowsIcon,
    },
    {
      name: "Delete table",
      // @ts-expect-error Need to replace Novel with real extensions
      command: () => editor?.chain().focus().deleteTable().run(),
      icon: TrashIcon,
      className: "text-destructive",
    },
  ];

  const groups = [
    {
      name: "Columns",
      items: columnMenuItems,
    },
    {
      name: "Rows",
      items: rowMenuItems,
    },
    {
      name: "Global",
      items: globalMenuItems,
    },
  ];

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.on("selectionUpdate", () => {
      const selection = window.getSelection();

      if (!(selection && editor.isActive("table"))) {
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        let startContainer = range.startContainer as HTMLElement | string;

        if (!(startContainer instanceof HTMLElement)) {
          startContainer = range.startContainer.parentElement as HTMLElement;
        }

        const tableNode = startContainer.closest("table");

        if (!tableNode) {
          return;
        }

        setTableLocation(tableNode.offsetTop);

        // Get the closest table cell (td or th)
        const tableCell = startContainer.closest("td, th");

        if (tableCell) {
          const cellRect = tableCell.getBoundingClientRect();
          const editorRect = editor.view.dom.getBoundingClientRect();

          setColumnMenuPosition({
            top: cellRect.top - (editorRect?.top ?? 0),
            left: cellRect.left + cellRect.width / 2 - (editorRect?.left ?? 0),
          });
        }

        const tableRow = startContainer.closest("tr");

        if (tableRow) {
          const rowRect = tableRow.getBoundingClientRect();
          const editorRect = editor.view.dom.getBoundingClientRect();

          setRowMenuPosition({
            top: rowRect.top + rowRect.height / 2 - (editorRect?.top ?? 0),
            left: rowRect.left - (editorRect?.left ?? 0),
          });
        }
      } catch (error) {
        const message = parseError(error);

        log.error(message);
      }
    });

    return () => {
      editor.off("selectionUpdate");
    };
  }, [editor]);

  if (!editor?.isActive("table")) {
    return null;
  }

  return (
    <>
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
        style={{
          top: columnMenuPosition.top,
          left: columnMenuPosition.left,
        }}
      >
        <DropdownMenu
          data={columnMenuItems.map((item) => ({
            onClick: item.command,
            children: (
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-2",
                  item.className
                )}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </div>
            ),
          }))}
        >
          <Button className="flex h-5 rounded-sm" size="icon" variant="ghost">
            <EllipsisIcon className="text-muted-foreground" size={16} />
          </Button>
        </DropdownMenu>
      </div>

      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
        style={{
          top: rowMenuPosition.top,
          left: rowMenuPosition.left,
        }}
      >
        <DropdownMenu
          data={rowMenuItems.map((item) => ({
            onClick: item.command,
            children: (
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-2",
                  item.className
                )}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </div>
            ),
          }))}
        >
          <Button
            className="flex h-9 w-5 rounded-sm"
            size="icon"
            variant="ghost"
          >
            <EllipsisVerticalIcon className="text-muted-foreground" size={16} />
          </Button>
        </DropdownMenu>
      </div>

      <div
        className="absolute left-2/4 flex translate-x-[-50%] overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
        style={{
          top: `${tableLocation - 50}px`,
        }}
      >
        {globalMenuItems.map((item) => (
          <Button
            className={cn("flex items-center gap-2", item.className)}
            key={item.name}
            onClick={item.command}
            size="sm"
            variant="ghost"
          >
            <item.icon size={16} />
            <span>{item.name}</span>
          </Button>
        ))}
      </div>
    </>
  );
};
