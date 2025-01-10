'use client';

import { deleteProduct } from '@/actions/product/delete';
import { updateProduct } from '@/actions/product/update';
import { nestGroups } from '@/lib/group';
import type { Group, Product } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { ProductsListGroup } from './products-list-group';
import { ProductsListItem } from './products-list-item';

type ProductsListProductProperties = {
  readonly data: Pick<Product, 'emoji' | 'id' | 'name'> & {
    readonly groups: Pick<Group, 'emoji' | 'id' | 'name' | 'parentGroupId'>[];
  };
  readonly role?: string;
};

export const ProductsListProduct = ({
  data,
  role,
}: ProductsListProductProperties) => {
  const groups = nestGroups([...data.groups]);
  const router = useRouter();
  const parameters = useParams();
  const active = parameters.product === data.id;

  const handleEmojiSelect = async (emoji: string) => {
    const { error } = await updateProduct(data.id, { emoji });

    if (error) {
      throw new Error(error);
    }
  };

  const handleRename = async (name: string) => {
    const { error } = await updateProduct(data.id, { name });

    if (error) {
      throw new Error(error);
    }
  };

  const handleDelete = async () => {
    const { error } = await deleteProduct(data.id);

    if (error) {
      throw new Error(error);
    }

    if (parameters.group === data.id) {
      router.push('/features');
    }
  };

  return (
    <div key={data.id}>
      <ProductsListItem
        id={data.id}
        name={data.name}
        href={`/features/products/${data.id}`}
        active={active}
        emoji={data.emoji}
        onEmojiSelect={handleEmojiSelect}
        onRename={handleRename}
        onDelete={handleDelete}
        createProps={{ productId: data.id }}
        hasChildren={groups.length > 0}
        role={role}
      >
        <div>
          {groups.map((group) => (
            <ProductsListGroup
              key={group.id}
              data={group}
              productId={data.id}
              role={role}
            />
          ))}
        </div>
      </ProductsListItem>
    </div>
  );
};
