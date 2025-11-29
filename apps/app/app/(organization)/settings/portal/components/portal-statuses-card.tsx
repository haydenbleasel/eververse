import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import { StackCard } from "@repo/design-system/components/stack-card";
import { ListTodoIcon } from "lucide-react";
import { database } from "@/lib/database";
import { StatusMappingsForm } from "./status-mappings-form";

export const PortalStatusesCard = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const [portalStatuses, featureStatuses] = await Promise.all([
    database.portalStatus.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        order: true,
        portalStatusMappings: {
          select: {
            id: true,
            featureStatus: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    }),
    database.featureStatus.findMany({
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),
  ]);

  return (
    <StackCard icon={ListTodoIcon} title="Statuses">
      <StatusMappingsForm
        defaultColumns={portalStatuses}
        disabled={user.user_metadata.organization_role === EververseRole.Member}
        statuses={featureStatuses}
      />
    </StackCard>
  );
};
