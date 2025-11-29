import { Input } from "@repo/design-system/components/precomposed/input";

type FeatureRiceInputProperties = {
  readonly value: number | undefined;
  readonly onChange: (value: number) => void;
};

const regex = /^[0-9\b]+$/u;

export const FeatureRiceInput = ({
  value,
  onChange,
}: FeatureRiceInputProperties) => {
  const handleChange = (newValue: string) => {
    // if value is not blank, then test the regex
    if (newValue === "" || regex.test(newValue)) {
      onChange(Number.parseInt(newValue, 10));
    }
  };

  return (
    <Input
      autoComplete="off"
      onChangeText={handleChange}
      placeholder="1"
      type="number"
      value={value}
    />
  );
};
