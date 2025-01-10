import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

type ProseProperties = ComponentProps<'div'>;

export const Prose = ({ className, ...properties }: ProseProperties) => (
  <div
    className={cn('prose prose-violet w-full', 'dark:prose-invert', className)}
    {...properties}
  />
);
