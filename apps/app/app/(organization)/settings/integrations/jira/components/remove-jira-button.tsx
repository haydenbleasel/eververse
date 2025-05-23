'use client';

import { deleteAtlassianInstallation } from '@/actions/atlassian-installation/delete';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const RemoveJiraButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemoveJira = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await deleteAtlassianInstallation();

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Jira integration removed');

      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="submit"
      variant="destructive"
      onClick={handleRemoveJira}
      disabled={loading}
    >
      Remove Jira Integration
    </Button>
  );
};
