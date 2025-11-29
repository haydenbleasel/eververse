import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";
import { DropdownMenu } from "./precomposed/dropdown-menu";
import { Button } from "./ui/button";

type DataTableColumnHeaderProperties<TData, TValue> =
  HTMLAttributes<HTMLDivElement> & {
    readonly column: Column<TData, TValue>;
    readonly title: string;
  };

export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProperties<TData, TValue>): ReactNode => {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  let Icon = ChevronsUpDownIcon;

  if (column.getIsSorted() === "desc") {
    Icon = ArrowDownIcon;
  } else if (column.getIsSorted() === "asc") {
    Icon = ArrowUpIcon;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu
        data={[
          {
            onClick: () => column.toggleSorting(false),
            children: (
              <>
                <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Asc
              </>
            ),
          },
          {
            onClick: () => column.toggleSorting(true),
            children: (
              <>
                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Desc
              </>
            ),
          },
        ]}
      >
        <Button
          className="-ml-3 flex h-8 items-center gap-2 data-[state=open]:bg-accent"
          size="sm"
          variant="ghost"
        >
          <span>{title}</span>
          <Icon size={16} />
        </Button>
      </DropdownMenu>
    </div>
  );
};
