'use client';

import { useChangelogForm } from '@/components/changelog-form/use-changelog-form';
import { EmptyState } from '@/components/empty-state';
import { emptyStates } from '@/lib/empty-states';
import { EververseRole } from '@repo/backend/auth';
import { Button } from '@repo/design-system/components/ui/button';

type ChangelogEmptyStateProperties = {
  readonly role: EververseRole;
};

export const ChangelogEmptyState = ({
  role,
}: ChangelogEmptyStateProperties) => {
  const { show } = useChangelogForm();
  const handleShow = () => show();

  return (
    <EmptyState {...emptyStates.changelog}>
      {role === EververseRole.Member ? null : (
        <Button onClick={handleShow} className="w-fit" variant="outline">
          Create a product update
        </Button>
      )}
    </EmptyState>
  );
};
