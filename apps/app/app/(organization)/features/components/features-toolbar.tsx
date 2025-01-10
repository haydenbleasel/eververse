import { updateFeatures } from '@/actions/feature/bulk/update';
import type {
  Feature,
  FeatureStatus,
  Group,
  Product,
  Release,
} from '@prisma/client';
import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { Select } from '@repo/design-system/components/precomposed/select';
import { useSidebar } from '@repo/design-system/components/ui/sidebar';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { cn } from '@repo/design-system/lib/utils';
import { QueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { FeatureToolbarDeleteButton } from './feature-toolbar-delete-button';
import { FeatureToolbarMoveButton } from './feature-toolbar-move-button';

type FeaturesToolbarProperties = {
  readonly statuses: Pick<FeatureStatus, 'color' | 'id' | 'name'>[];
  readonly products: Pick<Product, 'emoji' | 'id' | 'name'>[];
  readonly releases: Pick<Release, 'id' | 'title'>[];
  readonly groups: Pick<
    Group,
    'emoji' | 'id' | 'name' | 'parentGroupId' | 'productId'
  >[];
  readonly selected: string[];
  readonly onClose: () => void;
  readonly members: User[];
};

export const FeaturesToolbar = ({
  statuses,
  selected,
  products,
  releases,
  groups,
  onClose,
  members,
}: FeaturesToolbarProperties) => {
  const sidebar = useSidebar();
  const queryClient = new QueryClient();

  const handleUpdateFeatures = async (props: Partial<Feature>) => {
    try {
      const response = await updateFeatures(selected, props);

      if (response.error) {
        throw new Error(response.error);
      }

      onClose();
      toast.success('Features updated successfully!');

      await queryClient.invalidateQueries({
        queryKey: ['features'],
      });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 ml-px flex items-center justify-between gap-4 border-t bg-background/90 p-3 backdrop-blur-sm transition-all',
        sidebar.open ? 'left-[220px]' : 'left-16'
      )}
    >
      <p className="shrink-0 whitespace-nowrap font-medium text-muted-foreground text-sm">
        {selected.length} feature{selected.length === 1 ? '' : 's'} selected
      </p>
      <div className="flex flex-1 items-center justify-end gap-2">
        <div>
          <Select
            value={undefined}
            onChange={(statusId) => handleUpdateFeatures({ statusId })}
            data={statuses.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            renderItem={(item) => {
              const status = statuses.find(({ id }) => id === item.value);

              if (!status) {
                return null;
              }

              return (
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            }}
            type="status"
          />
        </div>
        <div>
          <Select
            value={undefined}
            onChange={(ownerId) => handleUpdateFeatures({ ownerId })}
            data={members.map((item) => ({
              value: item.id,
              label: getUserName(item),
            }))}
            renderItem={(item) => {
              const member = members.find(({ id }) => id === item.value);

              if (!member) {
                return null;
              }

              return (
                <div className="flex items-center gap-2">
                  <Image
                    src={member.user_metadata.image_url}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                  <span>{item.label}</span>
                </div>
              );
            }}
            type="owner"
          />
        </div>
        <div>
          <Select
            value={undefined}
            onChange={(releaseId) => handleUpdateFeatures({ releaseId })}
            data={releases.map((item) => ({
              value: item.id,
              label: item.title,
            }))}
            type="release"
          />
        </div>
        <FeatureToolbarMoveButton
          products={products}
          groups={groups}
          selected={selected}
          onClose={onClose}
        />
        <FeatureToolbarDeleteButton selected={selected} onClose={onClose} />
      </div>
    </div>
  );
};
