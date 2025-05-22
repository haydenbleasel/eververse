import './styles.css';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html
    lang="en"
    className={cn(fonts, 'h-full w-full')}
    suppressHydrationWarning
  >
    <head>
      <base target="_parent" />
    </head>
    <body className="h-full w-full">{children}</body>
  </html>
);

export default RootLayout;
