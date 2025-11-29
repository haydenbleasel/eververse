"use client";

import type { Changelog } from "@repo/backend/prisma/client";
import { AlertDialog } from "@repo/design-system/components/precomposed/alert-dialog";
import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { QueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteChangelog } from "@/actions/changelog/delete";

type ChangelogSettingsDropdownProperties = {
  readonly changelogId: Changelog["id"];
};

export const ChangelogSettingsDropdown = ({
  changelogId,
}: ChangelogSettingsDropdownProperties) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = new QueryClient();

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteChangelog(changelogId);

      if (error) {
        throw new Error(error);
      }

      await queryClient.invalidateQueries({
        queryKey: ["changelog"],
      });

      router.push("/changelog");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute top-2 right-2">
        <DropdownMenu
          data={[
            {
              onClick: () => setDeleteOpen(true),
              disabled: loading,
              children: "Delete",
            },
          ]}
        >
          <Tooltip align="end" content="Settings" side="bottom">
            <Button size="icon" variant="ghost">
              <MoreHorizontalIcon size={16} />
            </Button>
          </Tooltip>
        </DropdownMenu>
      </div>
      <AlertDialog
        description="This action cannot be undone. This will permanently this changelog."
        disabled={loading}
        onClick={handleDelete}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        title="Are you absolutely sure?"
      />
    </>
  );
};
