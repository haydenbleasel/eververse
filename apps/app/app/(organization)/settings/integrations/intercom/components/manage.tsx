'use client';

import { deleteIntercomInstallation } from '@/actions/intercom-installation/delete';
import type { IntercomInstallation } from '@repo/backend/prisma/client';
import { Prose } from '@repo/design-system/components/prose';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import Link from 'next/link';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

type ManageIntercomProps = {
  id: IntercomInstallation['id'];
  appId: IntercomInstallation['appId'];
};

export const ManageIntercom = ({ id, appId }: ManageIntercomProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await deleteIntercomInstallation(id);

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
        <h1 className="m-0 font-semibold text-4xl">Intercom</h1>
        <p className="mb-0 text-muted-foreground">
          Manage your Intercom integration.
        </p>
      </div>

      <StackCard title="Details" className="p-4">
        <p>Your Intercom app ID is: {appId}</p>
      </StackCard>

      <StackCard title="Usage" className="p-4">
        <Prose className="max-w-none">
          <p>
            To send feedback into Eververse, simply tag a conversation message
            with <code>Eververse</code> and you'll see it appear under{' '}
            <Link href="/feedback">Feedback</Link>!
          </p>
        </Prose>
      </StackCard>

      <StackCard title="Danger Zone" className="p-4">
        <form onSubmit={handleDelete}>
          <Button type="submit" variant="destructive">
            Remove Intercom Integration
          </Button>
        </form>
      </StackCard>
    </>
  );
};
