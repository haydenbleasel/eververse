"use client";

import type { Group, Product } from "@repo/backend/prisma/client";
import { useParams, useRouter } from "next/navigation";
import { deleteProduct } from "@/actions/product/delete";
import { updateProduct } from "@/actions/product/update";
import { nestGroups } from "@/lib/group";
import { ProductsListGroup } from "./products-list-group";
import { ProductsListItem } from "./products-list-item";

type ProductsListProductProperties = {
  readonly data: Pick<Product, "emoji" | "id" | "name"> & {
    readonly groups: Pick<Group, "emoji" | "id" | "name" | "parentGroupId">[];
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
      router.push("/features");
    }
  };

  return (
    <div key={data.id}>
      <ProductsListItem
        active={active}
        createProps={{ productId: data.id }}
        emoji={data.emoji}
        hasChildren={groups.length > 0}
        href={`/features/products/${data.id}`}
        id={data.id}
        name={data.name}
        onDelete={handleDelete}
        onEmojiSelect={handleEmojiSelect}
        onRename={handleRename}
        role={role}
      >
        <div>
          {groups.map((group) => (
            <ProductsListGroup
              data={group}
              key={group.id}
              productId={data.id}
              role={role}
            />
          ))}
        </div>
      </ProductsListItem>
    </div>
  );
};
