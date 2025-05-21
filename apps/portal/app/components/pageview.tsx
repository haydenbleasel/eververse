'use client';

import { pageview } from '@repo/analytics/posthog/client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const Pageview = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pageview(pathname, searchParams);
  }, [pathname, searchParams]);

  return null;
};
