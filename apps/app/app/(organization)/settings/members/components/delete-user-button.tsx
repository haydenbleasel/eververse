import { removeUser } from '@/actions/users/remove';
import type { User } from '@repo/backend/auth';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type DeleteUserButtonProperties = {
  readonly userId: User['id'];
};

export const DeleteUserButton = ({ userId }: DeleteUserButtonProperties) => {
  const [verification, setVerification] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeleteUser = async () => {
    try {
      setLoading(true);

      if (verification !== 'delete') {
        throw new Error('Please enter the word "delete" to confirm.');
      }

      const response = await removeUser(userId);

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success(response.message);
      setOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      title="Delete User"
      description="Are you sure you want to delete this user?"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="ghost" size="icon">
          <TrashIcon size={16} className="text-destructive" />
        </Button>
      }
      cta="Delete"
      onClick={handleDeleteUser}
      disabled={verification !== 'delete' || loading}
    >
      <p className="text-destructive text-sm">
        Please enter the word "delete" to confirm.
      </p>

      <Input
        placeholder="delete"
        value={verification}
        onChangeText={setVerification}
      />
    </Dialog>
  );
};
