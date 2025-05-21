'use client';

import { EmptyState } from '@/components/empty-state';
import { useFeatureForm } from '@/components/feature-form/use-feature-form';
import { emptyStates } from '@/lib/empty-states';
import { EververseRole } from '@repo/backend/auth';
import type { Group, Product } from '@repo/backend/prisma/client';
import { Button } from '@repo/design-system/components/ui/button';

type FeaturesEmptyStateProperties = {
  readonly groupId?: Group['id'];
  readonly productId?: Product['id'];
  readonly role?: string;
};

export const FeaturesEmptyState = ({
  groupId,
  productId,
  role,
}: FeaturesEmptyStateProperties) => {
  const { show } = useFeatureForm();

  const handleShow = () => show({ groupId, productId });

  return (
    <EmptyState {...emptyStates.feature}>
      {role !== EververseRole.Member && (
        <Button onClick={handleShow} className="w-fit">
          Create a feature
        </Button>
      )}
    </EmptyState>
  );
};
