'use client';

import { useInitiativeForm } from '@/components/initiative-form/use-initiative-form';
import { Button } from '@repo/design-system/components/ui/button';

export const CreateInitiativeButton = () => {
  const { show } = useInitiativeForm();
  const handleShow = () => show();

  return (
    <Button onClick={handleShow} className="w-fit">
      Create initiative
    </Button>
  );
};
