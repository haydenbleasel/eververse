'use client';

import { deleteOrganization } from '@/actions/organization/delete';
import { EververseRole } from '@repo/backend/auth';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type DeleteOrganizationFormProps = {
  organizationName: string;
  userRole: string;
};

export const DeleteOrganizationForm = ({
  organizationName,
  userRole,
}: DeleteOrganizationFormProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Only show delete option to admins
  if (userRole !== EververseRole.Admin) {
    return null;
  }

  const handleDeleteOrganization = async () => {
    try {
      setLoading(true);
      const result = await deleteOrganization();

      if ('error' in result) {
        throw new Error(result.error);
      }

      toast.success('Organization deleted successfully');
      // Redirect to onboarding or login after organization deletion
      router.push('/welcome');
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
          <h3 className="font-medium text-destructive">Delete Organization</h3>
          <p className="text-muted-foreground text-sm">
            Permanently delete "{organizationName}" and all associated data. This
            will remove all projects, feedback, and team members. This action
            cannot be undone.
          </p>
        </div>
        <AlertDialog
          title="Delete Organization"
          description={`Are you sure you want to delete "${organizationName}"? This action cannot be undone and will permanently remove all data including projects, feedback, and team members.`}
          onClick={handleDeleteOrganization}
          disabled={loading}
          cta="Delete Organization"
          trigger={
            <Button variant="destructive" disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Organization'}
            </Button>
          }
        />
      </div>
    </div>
  );
};