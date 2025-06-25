'use client';

import { deleteAccount } from '@/actions/account/delete';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const DeleteAccountForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const result = await deleteAccount();

      if ('error' in result) {
        throw new Error(result.error);
      }

      toast.success('Account deleted successfully');
      // Redirect to login page or home page after account deletion
      router.push('/auth/login');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-destructive bg-destructive/5 p-6">
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-destructive">Delete Account</h3>
          <p className="text-muted-foreground text-sm">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
        </div>
        <AlertDialog
          title="Delete Account"
          description="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data."
          onClick={handleDeleteAccount}
          disabled={loading}
          cta="Delete Account"
          trigger={
            <Button variant="destructive" disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          }
        />
      </div>
    </div>
  );
};