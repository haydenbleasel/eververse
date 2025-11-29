import type { FeatureStatus } from "@repo/backend/prisma/client";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Button } from "@repo/design-system/components/ui/button";
import { Label } from "@repo/design-system/components/ui/label";
import { handleError } from "@repo/design-system/lib/handle-error";
import { ArrowRightIcon, MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";

type FeatureStatusDropdownProperties = {
  readonly status: Pick<FeatureStatus, "color" | "id" | "name">;
  readonly statuses: Pick<FeatureStatus, "color" | "id" | "name">[];
  readonly onDelete: (mergeDestinationId: FeatureStatus["id"]) => void;
};

export const FeatureStatusDropdown = ({
  status,
  statuses,
  onDelete,
}: FeatureStatusDropdownProperties) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mergeDestinationId, setMergeDestinationId] = useState<
    string | undefined
  >();

  const handleStartDelete = () => {
    if (statuses.length === 1) {
      handleError("You cannot delete the last status.");
      return;
    }

    setDeleteDialogOpen(true);
  };

  const handleContinue = () => {
    if (!mergeDestinationId) {
      handleError("Please choose a status to migrate features to.");
      return;
    }

    onDelete(mergeDestinationId);
    setDeleteDialogOpen(false);
  };

  const selected = statuses.find(({ id }) => id === mergeDestinationId);

  return (
    <>
      <DropdownMenu data={[{ onClick: handleStartDelete, children: "Delete" }]}>
        <Button size="icon" variant="ghost">
          <MoreHorizontalIcon className="text-muted-foreground" size={16} />
        </Button>
      </DropdownMenu>
      <Dialog
        cta="Merge feature"
        description="If so, please choose a status to migrate relevant features to."
        disabled={!selected}
        modal={false}
        onClick={handleContinue}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        title="Are you absolutely sure?"
      >
        <div className="flex items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="source">Merge this feature...</Label>
            <div>
              <Button
                className="w-full justify-start gap-2"
                disabled
                variant="outline"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                {status.name}
              </Button>
            </div>
          </div>
          <div className="flex aspect-square h-9 shrink-0 items-center justify-center">
            <ArrowRightIcon className="text-muted-foreground" size={16} />
          </div>
          <div className="flex-1">
            <Select
              data={statuses
                .filter((item) => item.id !== status.id)
                .map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              label="Into this feature..."
              onChange={setMergeDestinationId}
              renderItem={(item) => {
                const current = statuses.find(({ id }) => id === item.value);

                if (!current) {
                  return null;
                }

                return (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: current.color }}
                    />
                    <span>{item.label}</span>
                  </div>
                );
              }}
              value={mergeDestinationId}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
