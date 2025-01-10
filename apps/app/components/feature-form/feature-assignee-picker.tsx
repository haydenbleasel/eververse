import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { Select } from '@repo/design-system/components/precomposed/select';
import Image from 'next/image';

type FeatureAssigneePickerProperties = {
  readonly data: User[];
  readonly value: string;
  readonly onChange: (value: string) => void;
};

export const FeatureAssigneePicker = ({
  data,
  value,
  onChange,
}: FeatureAssigneePickerProperties) => (
  <Select
    value={value}
    onChange={onChange}
    data={data.map((user) => ({
      value: user.id,
      label: getUserName(user) ?? '',
    }))}
    type="user"
    renderItem={(item) => {
      const user = data.find((user) => user.id === item.value);

      if (!user) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          {user.user_metadata.image_url ? (
            <Image
              src={user.user_metadata.image_url}
              width={16}
              height={16}
              className="rounded-full"
              alt=""
            />
          ) : (
            <div className="h-4 w-4 rounded-full bg-muted-foreground" />
          )}
          <span>{item.label}</span>
        </div>
      );
    }}
  />
);
