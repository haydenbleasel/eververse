'use client';

import { useId } from 'react';
import type { ChangeEventHandler, ComponentProps } from 'react';
import { Input as InputComponent } from '../ui/input';
import { Label } from '../ui/label';

type InputProperties = Omit<ComponentProps<typeof InputComponent>, 'id'> & {
  readonly label?: string;
  readonly onChangeText?: (value: string) => void;
};

export const Input = ({
  label,
  onChangeText,
  onChange,
  ...properties
}: InputProperties) => {
  const id = useId();
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    onChangeText?.(event.target.value);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <InputComponent
        id={id}
        name={id}
        onChange={handleChange}
        {...properties}
      />
    </div>
  );
};
