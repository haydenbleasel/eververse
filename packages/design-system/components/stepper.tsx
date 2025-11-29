"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useId } from "react";
import { cn } from "../lib/utils";
import { Input } from "./precomposed/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

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
        className={cn("flex w-full", className)}
        data-orientation="horizontal"
      >
        <Button
          className="shrink-0 rounded-r-none"
          disabled={disabled}
          onClick={() => handleChange(value - step)}
          size="icon"
          variant="outline"
        >
          <MinusIcon className="text-muted-foreground" size={16} />
        </Button>
        <div className="relative flex-1 shrink-0">
          <Input className="rounded-none border-x-0" disabled value={value} />
          {suffix && (
            <div className="pointer-events-none absolute top-0 right-0 flex h-9 w-9 select-none items-center justify-center text-muted-foreground text-sm">
              {suffix}
            </div>
          )}
        </div>
        <Button
          className="shrink-0 rounded-l-none"
          disabled={disabled}
          onClick={() => handleChange(value + step)}
          size="icon"
          variant="outline"
        >
          <PlusIcon className="text-muted-foreground" size={16} />
        </Button>
      </div>
    </div>
  );
};
