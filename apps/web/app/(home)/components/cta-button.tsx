'use client';

import { Button } from '@repo/design-system/components/ui/button';
import type { ButtonProps } from '@repo/design-system/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';

export const CTAButton = ({ size, ...properties }: ButtonProps) => (
  <Button asChild size={size} {...properties}>
    <a href="https://app.eververse.ai">
      <span className="relative z-10">Get started for free</span>
      <ArrowRightIcon size={size ? 12 : 16} />
    </a>
  </Button>
);
