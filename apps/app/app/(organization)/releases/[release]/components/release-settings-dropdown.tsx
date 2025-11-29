"use client";

import type { Release } from "@repo/backend/prisma/client";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteRelease } from "@/actions/release/delete";

type ReleaseSettingsDropdownProperties = {
  readonly releaseId: Release["id"];
};

export const ReleaseSettingsDropdown = ({
  releaseId,
}: ReleaseSettingsDropdownProperties) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteRelease(releaseId);

      if (error) {
        throw new Error(error);
      }

      setDeleteOpen(false);
      router.push("/releases");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu
        data={[
          {
            onClick: () => setDeleteOpen(true),
            disabled: loading,
            children: "Delete",
          },
        ]}
      >
        <div className="-m-2">
          <Tooltip align="end" content="Settings" side="bottom">
            <Button size="icon" variant="ghost">
              <MoreHorizontalIcon size={16} />
            </Button>
          </Tooltip>
        </div>
      </DropdownMenu>

      <AlertDialog
        description="This action cannot be undone. This will permanently delete this release."
        disabled={loading}
        onClick={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        title="Are you absolutely sure?"
      />
    </>
  );
};
