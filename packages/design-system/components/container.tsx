import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

type ContainerProperties = ComponentProps<'div'>;

export const Container = ({
  className,
  ...properties
}: ContainerProperties) => (
  <div
    className={cn('mx-auto w-full max-w-7xl px-4', className)}
    {...properties}
  />
);
