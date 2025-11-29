import "./styles.css";
import { AnalyticsProvider } from "@repo/analytics";
import { DesignSystemProvider } from "@repo/design-system/components/provider";
import { fonts } from "@repo/design-system/lib/fonts";
import { type ReactNode, Suspense } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { Identify } from "./components/identify";
import { Pageview } from "./components/pageview";

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
    <body className="min-h-screen bg-backdrop">
      <AnalyticsProvider>
        <Suspense fallback={null}>
          <Pageview />
          <Identify />
        </Suspense>
        <DesignSystemProvider>
          <QueryProvider>{children}</QueryProvider>
        </DesignSystemProvider>
      </AnalyticsProvider>
    </body>
  </html>
);

export default RootLayout;
