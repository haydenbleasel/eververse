'use client';

import { useId } from 'react';
import type { ChangeEventHandler, ComponentProps } from 'react';
import { Label } from '../ui/label';
import { Textarea as TextareaComponent } from '../ui/textarea';

type TextareaProperties = Omit<
  ComponentProps<typeof TextareaComponent>,
  'id'
> & {
  readonly label?: string;
  readonly onChangeText?: (value: string) => void;
  readonly caption?: string;
};

export const Textarea = ({
  label,
  onChangeText,
  onChange,
  caption,
  ...properties
}: TextareaProperties) => {
  const id = useId();
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onChange?.(event);
    onChangeText?.(event.target.value);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <TextareaComponent
        id={id}
        name={id}
        onChange={handleChange}
        {...properties}
      />
      {caption ? (
        <small className="text-muted-foreground">{caption}</small>
      ) : null}
    </div>
  );
};
