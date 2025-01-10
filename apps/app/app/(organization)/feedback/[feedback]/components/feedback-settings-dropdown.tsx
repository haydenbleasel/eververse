'use client';

import { deleteFeedback } from '@/actions/feedback/delete';
import { updateFeedback } from '@/actions/feedback/update';
import { FeedbackOrganizationPicker } from '@/components/feedback-form/feedback-organization-picker';
import { FeedbackUserPicker } from '@/components/feedback-form/feedback-user-picker';
import type {
  Feedback,
  FeedbackOrganization,
  FeedbackUser,
} from '@prisma/client';
import { AlertDialog } from '@repo/design-system/components/precomposed/alert-dialog';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { QueryClient } from '@tanstack/react-query';
import { MoreHorizontalIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FeedbackSettingsDropdownProperties = {
  readonly feedbackId: Feedback['id'];
  readonly defaultFeedbackUserId: string | undefined;
  readonly defaultFeedbackOrganizationId: string | undefined;
  readonly users: FeedbackUser[];
  readonly organizations: FeedbackOrganization[];
};

export const FeedbackSettingsDropdown = ({
  feedbackId,
  defaultFeedbackUserId,
  defaultFeedbackOrganizationId,
  users,
  organizations,
}: FeedbackSettingsDropdownProperties) => {
  const [feedbackUserId, setFeedbackUserId] = useState<string | null>(
    defaultFeedbackUserId ?? null
  );
  const [feedbackOrganizationId, setFeedbackOrganizationId] = useState<
    string | null
  >(defaultFeedbackOrganizationId ?? null);
  const [changeUserOpen, setChangeUserOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = new QueryClient();

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await deleteFeedback(feedbackId);

      if (error) {
        throw new Error(error);
      }

      await queryClient.invalidateQueries({ queryKey: ['feedback'] });

      setDeleteOpen(false);
      router.push('/feedback');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUser = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await updateFeedback(feedbackId, {
        feedbackUserId,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      setChangeUserOpen(false);
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
            children: 'Delete',
          },
          {
            onClick: () => setChangeUserOpen(true),
            disabled: loading,
            children: 'Change user',
          },
        ]}
      >
        <Tooltip content="Settings" side="bottom" align="end">
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon size={16} />
          </Button>
        </Tooltip>
      </DropdownMenu>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently this feedback."
        onClick={handleDelete}
        disabled={loading}
      />

      <Dialog
        open={changeUserOpen}
        onOpenChange={setChangeUserOpen}
        title="Change user"
        description="Who submitted this feedback?"
        onClick={handleChangeUser}
        disabled={loading}
        cta="Save"
      >
        <div className="flex items-center gap-2">
          <FeedbackUserPicker
            usersData={users.map((user) => ({
              value: user.id,
              label: user.name,
              image: user.imageUrl,
              email: user.email,
            }))}
            value={feedbackUserId}
            onChange={setFeedbackUserId}
          />
          {feedbackUserId ? (
            <FeedbackOrganizationPicker
              organizationsData={organizations.map((organization) => ({
                value: organization.id,
                label: organization.name,
                image: `https://logo.clearbit.com/${organization.domain}`,
              }))}
              value={feedbackOrganizationId}
              onChange={setFeedbackOrganizationId}
              feedbackUser={feedbackUserId}
            />
          ) : null}
        </div>
      </Dialog>
    </>
  );
};
