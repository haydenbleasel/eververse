"use client";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { updateInitiativeCanvas } from "@/actions/initiative-canvas/update";

type InitiativeCanvasDropdownProperties = {
  readonly canvasId: string;
  readonly defaultTitle: string;
};

export const InitiativeCanvasDropdown = ({
  canvasId,
  defaultTitle,
}: InitiativeCanvasDropdownProperties) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    setLoading(true);
    try {
      await updateInitiativeCanvas(canvasId, { title });

      setRenameOpen(false);
      toast.success("Canvas renamed");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu
          data={[{ onClick: () => setRenameOpen(true), children: "Rename" }]}
        >
          <Button size="icon" variant="secondary">
            <MoreHorizontalIcon size={16} />
          </Button>
        </DropdownMenu>
      </div>
      <Dialog
        cta="Rename"
        description="What would you like to rename this canvas to?"
        disabled={loading}
        onClick={handleRename}
        onOpenChange={setRenameOpen}
        open={renameOpen}
        title="Rename canvas"
      >
        <Input
          autoComplete="off"
          label="Canvas title"
          maxLength={191}
          onChangeText={setTitle}
          placeholder="My new canvas"
          value={title}
        />
      </Dialog>
    </>
  );
};
