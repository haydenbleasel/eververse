'use client';

import { Fragment, useId } from 'react';
import type { ComponentProps, FC } from 'react';
import * as BreadcrumbComponent from '../ui/breadcrumb';

export type BreadcrumbsProperties = ComponentProps<
  typeof BreadcrumbComponent.Breadcrumb
> & {
  readonly data: {
    readonly href: string;
    readonly text: string;
  }[];
  readonly title: string;
};

const BreadcrumbItem: FC<BreadcrumbsProperties['data'][number]> = ({
  href,
  text,
}) => {
  const id = useId();

  return (
    <Fragment key={id}>
      <BreadcrumbComponent.BreadcrumbItem className="shrink-0 truncate">
        <BreadcrumbComponent.BreadcrumbLink href={href}>
          {text}
        </BreadcrumbComponent.BreadcrumbLink>
      </BreadcrumbComponent.BreadcrumbItem>
      <BreadcrumbComponent.BreadcrumbSeparator />
    </Fragment>
  );
};

export const Breadcrumbs: FC<BreadcrumbsProperties> = ({
  data,
  title,
  ...properties
}) => (
  <BreadcrumbComponent.Breadcrumb {...properties} className="text-sm">
    <BreadcrumbComponent.BreadcrumbList className="flex-nowrap sm:gap-1.5">
      {data.map((item) => (
        <BreadcrumbItem key={item.href} {...item} />
      ))}
      <BreadcrumbComponent.BreadcrumbPage className="truncate font-medium">
        {title}
      </BreadcrumbComponent.BreadcrumbPage>
    </BreadcrumbComponent.BreadcrumbList>
  </BreadcrumbComponent.Breadcrumb>
);
