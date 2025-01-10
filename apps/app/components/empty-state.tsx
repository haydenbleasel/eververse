import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import type { PenIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProperties = {
  readonly icon?: typeof PenIcon;
  readonly title: string;
  readonly description: string;
  readonly children?: ReactNode;
  readonly loader?: boolean;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  children,
  loader,
}: EmptyStateProperties) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="max-w-md items-center gap-12 px-8">
      <div className="flex flex-col items-center text-center">
        {loader ? <LoadingCircle dimensions="w-6 mb-4 aspect-square" /> : null}
        {Icon ? (
          <Icon size={24} className="mb-4 text-muted-foreground" />
        ) : null}
        <p className="mb-2 font-medium text-foreground">{title}</p>
        <p className="mb-4 text-muted-foreground text-sm">{description}</p>
        {children}
      </div>
    </div>
  </div>
);
