'use client';

import { createGroup } from '@/actions/group/create';
import { nestGroups } from '@/lib/group';
import type { Group, Product } from '@repo/backend/prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GroupProductPicker } from './group-product-picker';
import { ParentGroupPicker } from './parent-group-picker';
import { useGroupForm } from './use-group-form';

type GroupFormProperties = {
  readonly products: Pick<Product, 'emoji' | 'id' | 'name'>[];
  readonly groups: Pick<
    Group,
    'emoji' | 'id' | 'name' | 'parentGroupId' | 'productId'
  >[];
};

export const GroupForm = ({ products, groups }: GroupFormProperties) => {
  const [name, setName] = useState('');
  const [productId, setProductId] = useState<string | undefined>();
  const [parentGroupId, setParentGroupId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const disabled = !name.trim() || loading || !productId;
  const { isOpen, toggle, hide } = useGroupForm();

  const handleCreate = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { id, error } = await createGroup({
        name,
        productId,
        parentGroupId,
      });

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error('Something went wrong');
      }

      setName('');
      setProductId(undefined);
      setParentGroupId(undefined);

      hide();
      router.push(`/features/groups/${id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const relevantGroups = groups.filter(
    (group) => group.productId === productId
  );

  const handleProductChange = (value: string) => {
    setProductId(value);
    setParentGroupId(undefined);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={toggle}
      modal={false}
      className="max-w-2xl"
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create a group
        </p>
      }
      cta="Create group"
      onClick={handleCreate}
      disabled={disabled}
      footer={
        <div className="flex items-center gap-3">
          <GroupProductPicker
            data={products}
            value={productId}
            onChange={handleProductChange}
          />
          {productId && relevantGroups.length > 0 ? (
            <ParentGroupPicker
              data={nestGroups(relevantGroups)}
              value={parentGroupId}
              onChange={setParentGroupId}
            />
          ) : null}
        </div>
      }
    >
      <Input
        placeholder="Admin Dashboard"
        value={name}
        onChangeText={setName}
        className="border-none p-0 font-medium text-lg shadow-none focus-visible:ring-0"
        maxLength={191}
        autoComplete="off"
      />
    </Dialog>
  );
};
