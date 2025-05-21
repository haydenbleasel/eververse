'use client';

import { updateFeature } from '@/actions/feature/update';
import { DocumentInput } from '@/components/document-input';
import type { Feature } from '@repo/backend/prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';

type FeatureTitleProperties = {
  readonly featureId: Feature['id'];
  readonly defaultTitle: Feature['title'];
  readonly editable: boolean;
};

export const FeatureTitle = ({
  featureId,
  defaultTitle,
  editable,
}: FeatureTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateFeature(featureId, {
        title: value,
      });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <DocumentInput
      defaultValue={defaultTitle}
      onDebouncedUpdate={handleDebouncedUpdate}
      disabled={!editable}
    />
  );
};
