import { updateFeatures } from '@/actions/feature/bulk/update';
import { FeatureGroupPicker } from '@/components/feature-form/feature-group-picker';
import { FeatureProductPicker } from '@/components/feature-form/feature-product-picker';
import { nestGroups } from '@/lib/group';
import type { Feature, Group, Product } from '@prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

type FeatureToolbarMoveButtonProperties = {
  readonly products: Pick<Product, 'emoji' | 'id' | 'name'>[];
  readonly groups: Pick<
    Group,
    'emoji' | 'id' | 'name' | 'parentGroupId' | 'productId'
  >[];
  readonly selected: Feature['id'][];
  readonly onClose: () => void;
};

export const FeatureToolbarMoveButton = ({
  products,
  groups,
  selected,
  onClose,
}: FeatureToolbarMoveButtonProperties) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState<string | undefined>();
  const [groupId, setGroupId] = useState<string | undefined>();
  const disabled = !productId || loading;
  const queryClient = new QueryClient();

  const handleMoveFeature: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (loading || selected.length === 0 || !productId) {
      return;
    }

    setOpen(false);
    setLoading(true);

    try {
      const response = await updateFeatures(selected, { productId, groupId });

      if (response.error) {
        throw new Error(response.error);
      }

      setOpen(false);
      onClose();
      toast.success('Features moved successfully!');

      await queryClient.invalidateQueries({
        queryKey: ['features'],
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const relevantGroups = groups.filter(
    (group) => group.productId === productId
  );

  const handleProductChange = (newValue: string) => {
    setProductId(newValue);
    setGroupId(undefined);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" disabled={loading} className="shrink-0">
          Move
        </Button>
      }
      title="Move Features"
      description="Move the selected features to another product or group."
      modal={false}
    >
      <form onSubmit={handleMoveFeature} className="space-y-4">
        <div className="flex items-center gap-3">
          {products.length > 0 ? (
            <FeatureProductPicker
              data={products}
              value={productId}
              onChange={handleProductChange}
            />
          ) : null}
          {productId && relevantGroups.length > 0 ? (
            <FeatureGroupPicker
              data={nestGroups(relevantGroups)}
              value={groupId}
              onChange={setGroupId}
            />
          ) : null}
        </div>

        <Button type="submit" disabled={disabled}>
          Move features
        </Button>
      </form>
    </Dialog>
  );
};
