'use client';

import { useReleaseForm } from '@/components/release-form/use-release-form';
import { Button } from '@repo/design-system/components/ui/button';

export const CreateReleaseButton = () => {
  const releaseForm = useReleaseForm();

  return (
    <Button variant="outline" onClick={releaseForm.show}>
      Create a release
    </Button>
  );
};
