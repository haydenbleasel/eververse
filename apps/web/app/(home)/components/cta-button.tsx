'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

export const CTAButton = ({
  size,
  ...properties
}: ComponentProps<typeof Button>) => (
  <Button asChild size={size} {...properties}>
    <a href="https://app.eververse.ai">
      <span className="relative z-10">Get started for free</span>
      <ArrowRightIcon size={size ? 12 : 16} />
    </a>
  </Button>
);
