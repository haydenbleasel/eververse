'use client';

import { useConnectForm } from '@/components/connect-form/use-connect-form';
import type { Feature } from '@repo/backend/prisma/client';
import { Button } from '@repo/design-system/components/ui/button';

type ConnectButtonProperties = {
  readonly featureId: Feature['id'];
};

export const ConnectButton = ({ featureId }: ConnectButtonProperties) => {
  const connectForm = useConnectForm();

  const handleShowConnect = () => {
    connectForm.show({ featureId });
  };

  return (
    <Button variant="outline" onClick={handleShowConnect}>
      Connect
    </Button>
  );
};
