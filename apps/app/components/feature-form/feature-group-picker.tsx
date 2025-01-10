import type { GroupWithSubgroups } from '@/lib/group';
import emojiData from '@emoji-mart/data';
import { Emoji } from '@repo/design-system/components/emoji';
import { Select } from '@repo/design-system/components/precomposed/select';
import { init } from 'emoji-mart';

init({ data: emojiData });

type FeatureGroupPickerProperties = {
  readonly data: GroupWithSubgroups[];
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
};

export const FeatureGroupPicker = ({
  data,
  value,
  onChange,
}: FeatureGroupPickerProperties) => {
  const flatten = (groups: GroupWithSubgroups[]): GroupWithSubgroups[] =>
    groups.reduce<GroupWithSubgroups[]>((accumulator, group) => {
      accumulator.push(group);

      if (group.subgroups.length > 0) {
        accumulator.push(...flatten(group.subgroups));
      }

      return accumulator;
    }, []);

  const flattenedData = flatten(data);

  return (
    <Select
      value={value}
      onChange={onChange}
      data={flattenedData.map((group) => ({
        value: group.id,
        label: group.name,
      }))}
      disabled={data.length === 0}
      renderItem={(item) => {
        const group = flattenedData.find((option) => option.id === item.value);

        if (!group) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Emoji id={group.emoji} size="1rem" />
            <span>{item.label}</span>
          </div>
        );
      }}
      type="group"
    />
  );
};
