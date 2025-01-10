'use client';

import { useChangelogForm } from '@/components/changelog-form/use-changelog-form';
import { Button } from '@repo/design-system/components/ui/button';
import { PlusIcon } from 'lucide-react';

export const CreateChangelogButton = () => {
  const { show } = useChangelogForm();

  return (
    <Button variant="ghost" size="icon" onClick={show}>
      <PlusIcon size={16} />
    </Button>
  );
};
