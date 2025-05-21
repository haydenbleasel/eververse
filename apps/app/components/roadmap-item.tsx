import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import type { GanttFeature } from '@repo/design-system/components/ui/kibo-ui/gantt';
import { memo } from 'react';
import { AvatarTooltip } from './avatar-tooltip';

type FeatureItemProperties = {
  readonly feature: GanttFeature;
  readonly owner?: User;
};

const FeatureItem = ({ feature, owner }: FeatureItemProperties) => {
  const name = owner ? getUserName(owner) : undefined;

  return (
    <div className="flex w-full items-center gap-2 overflow-hidden">
      <p className="flex-1 truncate text-xs">{feature.name}</p>
      {owner && (
        <AvatarTooltip
          key={owner.id}
          src={owner.user_metadata.image_url}
          fallback={name?.slice(0, 2) ?? '??'}
          title={name ?? ''}
          subtitle={name ?? ''}
        />
      )}
    </div>
  );
};

export const FeatureItemInner = memo(FeatureItem);
