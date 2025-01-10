'use client';

import { MinusIcon, PlusIcon } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../lib/utils';
import { Input } from './precomposed/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

type StepperProps = {
  max: number;
  min: number;
  value: number;
  onChange: (value: number) => void;
  step: number;
  disabled?: boolean;
  className?: string;
  suffix?: string;
  label?: string;
};

export const Stepper = ({
  max,
  min,
  value,
  onChange,
  step,
  disabled,
  className,
  suffix,
  label,
}: StepperProps) => {
  const id = useId();

  const handleChange = (newValue: number) => {
    if (newValue > max) {
      onChange(max);
    } else if (newValue < min) {
      onChange(min);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        aria-orientation="horizontal"
        data-orientation="horizontal"
        className={cn('flex w-full', className)}
      >
        <Button
          className="shrink-0 rounded-r-none"
          size="icon"
          variant="outline"
          disabled={disabled}
          onClick={() => handleChange(value - step)}
        >
          <MinusIcon size={16} className="text-muted-foreground" />
        </Button>
        <div className="relative flex-1 shrink-0">
          <Input className="rounded-none border-x-0" value={value} disabled />
          {suffix && (
            <div className="pointer-events-none absolute top-0 right-0 flex h-9 w-9 select-none items-center justify-center text-muted-foreground text-sm">
              {suffix}
            </div>
          )}
        </div>
        <Button
          className="shrink-0 rounded-l-none"
          size="icon"
          variant="outline"
          disabled={disabled}
          onClick={() => handleChange(value + step)}
        >
          <PlusIcon size={16} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
