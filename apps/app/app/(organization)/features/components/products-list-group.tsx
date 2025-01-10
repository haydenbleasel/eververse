import { deleteGroup } from '@/actions/group/delete';
import { updateGroup } from '@/actions/group/update';
import type { GroupWithSubgroups } from '@/lib/group';
import type { Product } from '@prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useParams, useRouter } from 'next/navigation';
import { ProductsListItem } from './products-list-item';

type ProductsListGroupProperties = {
  readonly data: GroupWithSubgroups;
  readonly productId: Product['id'];
  readonly level?: number;
  readonly role?: string;
};

export const ProductsListGroup = ({
  data,
  productId,
  level = 1,
  role,
}: ProductsListGroupProperties) => {
  const parameters = useParams();
  const router = useRouter();

  const handleEmojiSelect = async (emoji: string) => {
    try {
      const { error } = await updateGroup(data.id, { emoji });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleRename = async (name: string) => {
    const { error } = await updateGroup(data.id, { name });

    if (error) {
      throw new Error(error);
    }
  };

  const handleDelete = async () => {
    const { error } = await deleteGroup(data.id);

    if (error) {
      throw new Error(error);
    }

    if (parameters.group === data.id) {
      router.push('/features');
    }
  };

  return (
    <div key={data.id} className="pl-6">
      <ProductsListItem
        id={data.id}
        name={data.name}
        href={`/features/groups/${data.id}`}
        active={parameters.group === data.id}
        emoji={data.emoji}
        onEmojiSelect={handleEmojiSelect}
        onRename={handleRename}
        onDelete={handleDelete}
        className="rounded-l"
        createProps={{ productId, groupId: data.id }}
        hasChildren={data.subgroups.length > 0}
        role={role}
      >
        <div>
          {data.subgroups.map((group) => (
            <ProductsListGroup
              key={group.id}
              data={group}
              level={level + 1}
              productId={productId}
              role={role}
            />
          ))}
        </div>
      </ProductsListItem>
    </div>
  );
};
