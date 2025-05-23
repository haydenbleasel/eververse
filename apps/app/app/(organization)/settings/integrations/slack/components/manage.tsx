'use client';

import { deleteSlackInstallation } from '@/actions/slack-installation/delete';
import { testSlackInstallation } from '@/actions/slack-installation/test';
import type { SlackInstallation } from '@repo/backend/prisma/client';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useRouter } from 'next/navigation';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

type ManageSlackProps = {
  id: SlackInstallation['id'];
};

export const ManageSlack = ({ id }: ManageSlackProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await deleteSlackInstallation(id);

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Slack integration removed');

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await testSlackInstallation();

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Done! You should receive a message in Slack.');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl">Slack</h1>
        <p className="mb-0 text-muted-foreground">
          Manage your Slack integration.
        </p>
      </div>

      <StackCard title="Test Slack Integration" className="p-4">
        <Button variant="outline" onClick={handleTest} disabled={loading}>
          Test Slack Integration
        </Button>
      </StackCard>

      <StackCard title="Danger Zone" className="p-4">
        <form onSubmit={handleDelete}>
          <Button type="submit" variant="destructive" disabled={loading}>
            Remove Slack Integration
          </Button>
        </form>
      </StackCard>
    </>
  );
};
