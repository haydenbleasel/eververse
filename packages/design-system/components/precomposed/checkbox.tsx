import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';
import { Checkbox as ShadcnCheckbox } from '../ui/checkbox';

type CheckboxProps = ComponentProps<typeof ShadcnCheckbox>;

export const Checkbox = ({ className, ...props }: CheckboxProps) => {
  return (
    <ShadcnCheckbox
      {...props}
      className={cn(
        className,
        'border-foreground data-[state=checked]:border-primary'
      )}
    />
  );
};
