'use client';

import {
  Breadcrumbs,
  type BreadcrumbsProperties,
} from '@repo/design-system/components/precomposed/breadcrumbs';
import { capitalize } from '@repo/lib/format';
import { usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { useEffect, useState } from 'react';

const parseSegmentName = (segment: string) =>
  capitalize(segment.replace(/[()]/g, ''));

const getTitle = () =>
  typeof window === 'undefined' ? '' : window.document.title.split(' | ').at(0);

const getBreadcrumbsData = (segments: string[]) => {
  const data: BreadcrumbsProperties['data'] = [];
  const path: string[] = [];

  const segmentsToParse = segments.filter((segment) => !segment.includes('('));

  // Remove the last segment if it doesn't start with '('
  if (segmentsToParse.length > 0 && !segmentsToParse.at(-1)?.startsWith('(')) {
    segmentsToParse.pop();
  }

  for (const segment of segmentsToParse) {
    path.push(segment);
    data.push({
      href: `/${path.join('/')}`,
      text: parseSegmentName(segment),
    });
  }

  return data;
};

export const GlobalBreadcrumbs = () => {
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();
  const [title, setTitle] = useState(getTitle() ?? '');
  const data = getBreadcrumbsData(segments);

  // biome-ignore lint/correctness/useExhaustiveDependencies: "Refresh on path change"
  useEffect(() => {
    setTitle(getTitle() ?? '');
  }, [pathname]);

  return <Breadcrumbs data={data} title={title} />;
};
