import '@repo/design-system/styles/globals.css';
import { AnalyticsProvider } from '@repo/analytics';
import { Container } from '@repo/design-system/components/container';
import { DesignSystemProvider } from '@repo/design-system/components/provider';
import { fonts } from '@repo/design-system/lib/fonts';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Navbar } from './components/navbar';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html lang="en" className={fonts}>
    <body className="bg-background">
      <AnalyticsProvider>
        <DesignSystemProvider>
          <Navbar />
          <Container className="py-8">{children}</Container>
          <Footer />
        </DesignSystemProvider>
      </AnalyticsProvider>
    </body>
  </html>
);

export default RootLayout;
