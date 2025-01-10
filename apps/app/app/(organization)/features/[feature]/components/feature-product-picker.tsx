'use client';

import { updateFeature } from '@/actions/feature/update';
import type { Feature, Product } from '@prisma/client';
import { Emoji } from '@repo/design-system/components/emoji';
import { Select } from '@repo/design-system/components/precomposed/select';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useState } from 'react';

type FeatureProductPickerProperties = {
  readonly featureId: Feature['id'];
  readonly defaultValue: string | undefined;
  readonly disabled: boolean;
  readonly data: Pick<Product, 'id' | 'name' | 'emoji'>[];
};

export const FeatureProductPicker = ({
  featureId,
  defaultValue,
  disabled,
  data,
}: FeatureProductPickerProperties) => {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (newValue: string) => {
    if (newValue === value || loading) {
      return;
    }

    setLoading(true);
    setValue(newValue);

    try {
      const { error } = await updateFeature(featureId, { productId: newValue });

      if (error) {
        throw new Error(error);
      }

      toast.success('Product updated');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={value}
      onChange={handleSelect}
      data={data.map((group) => ({
        label: group.name,
        value: group.id,
      }))}
      disabled={disabled || loading}
      renderItem={(item) => {
        const product = data.find((product) => product.id === item.value);

        if (!product) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Emoji id={product.emoji} size="0.825rem" />
            <span className="flex-1 truncate">{item.label}</span>
          </div>
        );
      }}
      type="product"
    />
  );
};
