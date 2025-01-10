import { useId } from 'react';
import type { ComponentProps } from 'react';
import { Label } from '../ui/label';
import * as SwitchComponent from '../ui/switch';

type SwitchProperties = Omit<
  ComponentProps<typeof SwitchComponent.Switch>,
  'id'
> & {
  readonly label?: string;
  readonly description?: string;
};

export const Switch = ({
  label,
  description,
  ...properties
}: SwitchProperties) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="flex items-center gap-1.5">
        <SwitchComponent.Switch id={id} {...properties} />
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
    </div>
  );
};
