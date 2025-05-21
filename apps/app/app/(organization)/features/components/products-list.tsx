'use client';

import type { Group, Product } from '@repo/backend/prisma/client';
import { usePathname } from 'next/navigation';
import { ProductsListItem } from './products-list-item';
import { ProductsListProduct } from './products-list-product';

type ProductsListProperties = {
  readonly products: (Pick<Product, 'emoji' | 'id' | 'name'> & {
    readonly groups: Pick<Group, 'emoji' | 'id' | 'name' | 'parentGroupId'>[];
  })[];
  readonly role?: string;
};

export const ProductsList = ({ products, role }: ProductsListProperties) => {
  const pathname = usePathname();

  return (
    <div className="h-full divide-y pb-16">
      <ProductsListItem
        id="all"
        name="All Products"
        href="/features"
        active={pathname === '/features'}
        emoji="package"
        role={role}
      />
      {products
        .sort((productA, productB) =>
          productA.name.localeCompare(productB.name)
        )
        .map((product) => (
          <ProductsListProduct key={product.id} data={product} role={role} />
        ))}
    </div>
  );
};
