import { Prose } from '@repo/design-system/components/prose';
import type { ReactElement } from 'react';

type IntegrationsLayoutProperties = {
  readonly children: ReactElement<any>;
};

const IntegrationsLayout = async ({
  children,
}: IntegrationsLayoutProperties) => (
  <div className="px-6 py-16">
    <Prose className="mx-auto flex flex-col gap-6">{children}</Prose>
  </div>
);

export default IntegrationsLayout;
