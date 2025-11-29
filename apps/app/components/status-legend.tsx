import type { FeatureStatus } from "@repo/backend/prisma/client";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import { ListTodoIcon } from "lucide-react";
import { useState } from "react";

type StatusLegendProperties = {
  readonly statuses: Pick<FeatureStatus, "color" | "id" | "name" | "order">[];
};

export const StatusLegend = ({ statuses }: StatusLegendProperties) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <div>
          <Tooltip content="Legend">
            <Button
              className={cn(open && "bg-card")}
              size="icon"
              variant="ghost"
            >
              <ListTodoIcon
                className={cn(
                  "text-muted-foreground",
                  open && "text-foreground"
                )}
                size={16}
              />
            </Button>
          </Tooltip>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <p className="mb-2 font-medium text-muted-foreground text-sm">
          Status Legend
        </p>
        <div className="space-y-1">
          {statuses
            .sort((statusA, statusB) => statusA.order - statusB.order)
            .map((status) => (
              <div className="flex items-center gap-2 text-sm" key={status.id}>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span>{status.name}</span>
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
