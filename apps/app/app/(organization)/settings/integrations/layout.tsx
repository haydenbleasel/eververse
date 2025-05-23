import type { ReactElement } from 'react';

type IntegrationsLayoutProperties = {
  readonly children: ReactElement;
};

const IntegrationsLayout = async ({
  children,
}: IntegrationsLayoutProperties) => (
  <div className="px-6 py-16">
    <div className="mx-auto grid w-full max-w-3xl gap-6">{children}</div>
  </div>
);

export default IntegrationsLayout;
