'use client';

import { useFeatureForm } from '@/components/feature-form/use-feature-form';
import { useGroupForm } from '@/components/group-form/use-group-form';
import { useProductForm } from '@/components/product-form/use-product-form';
import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Button } from '@repo/design-system/components/ui/button';
import { PlusIcon } from 'lucide-react';

type FeatureCreateDropdownProperties = {
  readonly hasProducts: boolean;
};

export const FeatureCreateDropdown = ({
  hasProducts,
}: FeatureCreateDropdownProperties) => {
  const featureForm = useFeatureForm();
  const productForm = useProductForm();
  const groupForm = useGroupForm();

  return (
    <DropdownMenu
      data={[
        { onClick: () => featureForm.show(), children: 'Feature' },
        { onClick: () => productForm.show(), children: 'Product' },
        {
          onClick: () => (hasProducts ? groupForm.show() : null),
          children: 'Group',
          disabled: !hasProducts,
        },
      ]}
      label="Create a new..."
    >
      <div className="-m-2">
        <Button variant="ghost" size="icon">
          <PlusIcon size={16} />
        </Button>
      </div>
    </DropdownMenu>
  );
};
