'use client';

import { deleteChangelog } from '@/actions/changelog/delete';
import type { Changelog } from '@prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { QueryClient } from '@tanstack/react-query';
import { MoreHorizontalIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ChangelogSettingsDropdownProperties = {
  readonly changelogId: Changelog['id'];
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
        queryKey: ['changelog'],
      });

      router.push('/changelog');
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
              children: 'Delete',
            },
          ]}
        >
          <Tooltip content="Settings" side="bottom" align="end">
            <Button variant="ghost" size="icon">
              <MoreHorizontalIcon size={16} />
            </Button>
          </Tooltip>
        </DropdownMenu>
      </div>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently this changelog."
        onClick={handleDelete}
        disabled={loading}
      />
    </>
  );
};
