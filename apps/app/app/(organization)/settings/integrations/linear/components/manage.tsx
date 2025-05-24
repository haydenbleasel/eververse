'use client';

import { deleteLinearInstallation } from '@/actions/linear-installation/delete';
import type { LinearInstallation } from '@repo/backend/prisma/client';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

type ManageLinearProps = {
  id: LinearInstallation['id'];
};

export const ManageLinear = ({ id }: ManageLinearProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await deleteLinearInstallation(id);

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Intercom integration removed');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl tracking-tight">Linear</h1>
        <p className="mb-0 text-muted-foreground">
          Manage your Linear integration.
        </p>
      </div>

      <StackCard title="Danger Zone" className="p-4">
        <form onSubmit={handleDelete}>
          <Button type="submit" variant="destructive">
            Remove Linear Integration
          </Button>
        </form>
      </StackCard>
    </>
  );
};
