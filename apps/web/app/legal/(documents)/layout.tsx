import { Container } from '@repo/design-system/components/container';
import { Prose } from '@repo/design-system/components/prose';
import type { ReactNode } from 'react';

type LegalLayoutProps = {
  children: ReactNode;
};

const LegalLayout = ({ children }: LegalLayoutProps) => (
  <Container className="border-x">
    <Prose className="mx-auto px-4 py-16">{children}</Prose>
  </Container>
);

export default LegalLayout;
