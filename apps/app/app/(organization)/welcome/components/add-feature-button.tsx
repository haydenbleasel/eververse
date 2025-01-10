'use client';

import { useFeatureForm } from '@/components/feature-form/use-feature-form';
import { Button } from '@repo/design-system/components/ui/button';

export const AddFeatureButton = () => {
  const { show } = useFeatureForm();
  const handleShow = () => show();

  return (
    <Button onClick={handleShow} className="w-fit">
      Add feature
    </Button>
  );
};
