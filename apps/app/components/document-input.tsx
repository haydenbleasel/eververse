import { cn } from '@repo/design-system/lib/utils';
import { type ChangeEventHandler, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';
import { useDebouncedCallback } from 'use-debounce';

type DocumentInputProperties = {
  readonly defaultValue: string;
  readonly onUpdate?: (value: string) => void;
  readonly onDebouncedUpdate?: (value: string) => void;
  readonly disabled?: boolean;
  readonly className?: string;
};

export const DocumentInput = ({
  defaultValue,
  onUpdate,
  onDebouncedUpdate,
  disabled = false,
  className,
}: DocumentInputProperties) => {
  const [value, setValue] = useState(defaultValue);
  const debouncedUpdates = useDebouncedCallback(
    (value: string) => onDebouncedUpdate?.(value),
    750
  );

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const newTitle = event.target.value.replaceAll('\n', '');

    onUpdate?.(newTitle);
    debouncedUpdates(newTitle);
    setValue(newTitle);
  };

  return (
    <ReactTextareaAutosize
      placeholder="Enter a title..."
      className={cn(
        'w-full resize-none border-none bg-transparent p-0 font-semibold text-4xl tracking-tight shadow-none outline-none',
        'text-foreground',
        className
      )}
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  );
};
