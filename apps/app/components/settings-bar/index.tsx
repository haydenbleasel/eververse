import type { ReactElement, ReactNode } from 'react';

type SettingsBarItemProperties = {
  readonly title: string;
  readonly children: ReactElement<any>;
  readonly action?: ReactNode;
};

type SettingsBarProperties = {
  readonly children: ReactNode;
};

const Root = ({ children }: SettingsBarProperties) => (
  <div className="sticky top-0 flex h-screen w-full max-w-[280px] shrink-0 flex-col gap-6 overflow-y-auto border-l p-3 pb-6">
    {children}
  </div>
);

const Item = ({ title, children, action }: SettingsBarItemProperties) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">{title}</p>
      {action}
    </div>
    {children}
  </div>
);

export { Root, Item };
