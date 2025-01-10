import { database } from '@/lib/database';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';
import { TablePropertiesIcon } from 'lucide-react';

export const PortalFeaturesCard = async () => {
  const portalFeatures = await database.portalFeature.findMany({
    select: {
      id: true,
      featureId: true,
      title: true,
    },
  });

  return (
    <StackCard title="Features" icon={TablePropertiesIcon}>
      <p>You currently have {portalFeatures.length} features in your portal.</p>
      {portalFeatures.length > 0 ? (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border p-3">
          {portalFeatures.map((feature) => (
            <Link key={feature.id} href={`/features/${feature.featureId}`}>
              {feature.title}
            </Link>
          ))}
        </div>
      ) : null}
    </StackCard>
  );
};
