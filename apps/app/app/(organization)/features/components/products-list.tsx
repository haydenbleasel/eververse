"use client";

import type { Group, Product } from "@repo/backend/prisma/client";
import { usePathname } from "next/navigation";
import { ProductsListItem } from "./products-list-item";
import { ProductsListProduct } from "./products-list-product";

type ProductsListProperties = {
  readonly products: (Pick<Product, "emoji" | "id" | "name"> & {
    readonly groups: Pick<Group, "emoji" | "id" | "name" | "parentGroupId">[];
  })[];
  readonly role?: string;
};

export const ProductsList = ({ products, role }: ProductsListProperties) => {
  const pathname = usePathname();

  return (
    <div className="h-full divide-y pb-16">
      <ProductsListItem
        active={pathname === "/features"}
        emoji="package"
        href="/features"
        id="all"
        name="All Products"
        role={role}
      />
      {products
        .sort((productA, productB) =>
          productA.name.localeCompare(productB.name)
        )
        .map((product) => (
          <ProductsListProduct data={product} key={product.id} role={role} />
        ))}
    </div>
  );
};
