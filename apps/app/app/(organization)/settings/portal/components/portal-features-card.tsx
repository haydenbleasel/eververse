import { Link } from "@repo/design-system/components/link";
import { StackCard } from "@repo/design-system/components/stack-card";
import { TablePropertiesIcon } from "lucide-react";
import { database } from "@/lib/database";

export const PortalFeaturesCard = async () => {
  const portalFeatures = await database.portalFeature.findMany({
    select: {
      id: true,
      featureId: true,
      title: true,
    },
  });

  return (
    <StackCard icon={TablePropertiesIcon} title="Features">
      <p>You currently have {portalFeatures.length} features in your portal.</p>
      {portalFeatures.length > 0 ? (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border p-3">
          {portalFeatures.map((feature) => (
            <Link href={`/features/${feature.featureId}`} key={feature.id}>
              {feature.title}
            </Link>
          ))}
        </div>
      ) : null}
    </StackCard>
  );
};
