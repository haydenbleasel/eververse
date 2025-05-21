import emojiData from '@emoji-mart/data';
import type { Product } from '@repo/backend/prisma/client';
import { Emoji } from '@repo/design-system/components/emoji';
import { Select } from '@repo/design-system/components/precomposed/select';
import { init } from 'emoji-mart';

init({ data: emojiData });

type FeatureProductPickerProperties = {
  readonly data: Pick<Product, 'emoji' | 'id' | 'name'>[];
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
};

export const FeatureProductPicker = ({
  data,
  value,
  onChange,
}: FeatureProductPickerProperties) => (
  <Select
    onChange={onChange}
    value={value}
    data={data.map((product) => ({
      value: product.id,
      label: product.name,
    }))}
    disabled={data.length === 0}
    type="product"
    renderItem={(item) => {
      const product = data.find(({ id }) => id === item.value);

      if (!product) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          <Emoji id={product.emoji} size="0.825rem" />
          <span>{item.label}</span>
        </div>
      );
    }}
  />
);
