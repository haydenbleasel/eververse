import type { Product } from '@repo/backend/prisma/client';
import { Emoji } from '@repo/design-system/components/emoji';
import { Select } from '@repo/design-system/components/precomposed/select';

type GroupProductPickerProperties = {
  readonly data: Pick<Product, 'emoji' | 'id' | 'name'>[];
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
};

export const GroupProductPicker = ({
  data,
  value,
  onChange,
}: GroupProductPickerProperties) => (
  <Select
    value={value}
    onChange={onChange}
    data={data.map((item) => ({
      label: item.name,
      value: item.id,
    }))}
    type="product"
    renderItem={(item) => {
      const product = data.find(({ id }) => id === item.value);

      if (!product) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          <Emoji id={product.emoji} size="0.825rem" />
          <span className="truncate">{item.label}</span>
        </div>
      );
    }}
  />
);
