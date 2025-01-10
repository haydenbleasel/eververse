import type { FeatureStatus } from '@prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { tailwind } from '@repo/tailwind-config';
import { useState } from 'react';

const colors = [
  tailwind.theme.colors.gray[500],
  tailwind.theme.colors.red[500],
  tailwind.theme.colors.orange[500],
  tailwind.theme.colors.amber[500],
  tailwind.theme.colors.yellow[500],
  tailwind.theme.colors.lime[500],
  tailwind.theme.colors.green[500],
  tailwind.theme.colors.emerald[500],
  tailwind.theme.colors.teal[500],
  tailwind.theme.colors.cyan[500],
  tailwind.theme.colors.sky[500],
  tailwind.theme.colors.blue[500],
  tailwind.theme.colors.indigo[500],
  tailwind.theme.colors.violet[500],
  tailwind.theme.colors.purple[500],
  tailwind.theme.colors.fuchsia[500],
  tailwind.theme.colors.pink[500],
  tailwind.theme.colors.rose[500],
];

type FeatureStatusColorPickerProperties = {
  readonly value: FeatureStatus['color'];
  readonly onChange: (value: FeatureStatus['color']) => void;
};

export const FeatureStatusColorPicker = ({
  value,
  onChange,
}: FeatureStatusColorPickerProperties) => {
  const [open, setOpen] = useState(false);

  const handleClick = (color: FeatureStatus['color']) => {
    onChange(color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono uppercase">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid grid-cols-6 gap-4">
          {colors.map((color) => (
            <button
              type="button"
              key={color}
              className={cn(
                'block aspect-square w-full rounded-full',
                color === value && 'ring-2 ring-offset-2'
              )}
              style={{
                backgroundColor: color,

                /* @ts-expect-error "CSS Variables" */
                '--tw-ring-color': color,
              }}
              onClick={() => handleClick(color)}
              aria-label={`Change color to ${color}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
