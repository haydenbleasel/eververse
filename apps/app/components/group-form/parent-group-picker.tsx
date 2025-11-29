import { Emoji } from "@repo/design-system/components/emoji";
import { Select } from "@repo/design-system/components/precomposed/select";
import type { GroupWithSubgroups } from "@/lib/group";

type ParentGroupPickerProperties = {
  readonly data: GroupWithSubgroups[];
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
};

export const ParentGroupPicker = ({
  data,
  value,
  onChange,
}: ParentGroupPickerProperties) => {
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
      data={flattenedData.map(({ id, name }) => ({
        value: id,
        label: name,
      }))}
      onChange={onChange}
      renderItem={(item) => {
        const group = flattenedData.find(({ id }) => id === item.value);

        if (!group) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Emoji id={group.emoji} size="0.825rem" />
            <span className="truncate">{item.label}</span>
          </div>
        );
      }}
      type="group"
      value={value}
    />
  );
};
