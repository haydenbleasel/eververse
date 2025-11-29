"use client";

import type { Feature } from "@repo/backend/prisma/client";
import { Button } from "@repo/design-system/components/ui/button";
import { useConnectForm } from "@/components/connect-form/use-connect-form";

type ConnectButtonProperties = {
  readonly featureId: Feature["id"];
};

export const ConnectButton = ({ featureId }: ConnectButtonProperties) => {
  const connectForm = useConnectForm();

  const handleShowConnect = () => {
    connectForm.show({ featureId });
  };

  return (
    <Button onClick={handleShowConnect} variant="outline">
      Connect
    </Button>
  );
};
