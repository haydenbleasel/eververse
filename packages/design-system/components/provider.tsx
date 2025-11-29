"use client";

import { colors } from "@repo/design-system/lib/colors";
import Script from "next/script";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ReactNode } from "react";
import { TooltipProvider } from "./precomposed/tooltip";
import { Toaster } from "./ui/sonner";

type DesignSystemProviderProperties = ThemeProviderProps & {
  readonly children: ReactNode;
};

const IframelyEmbed = () => {
  const { resolvedTheme } = useTheme();
  if (!process.env.NEXT_PUBLIC_IFRAMELY_API_KEY) {
    return null;
  }

  const scriptUrl = new URL("https://cdn.iframe.ly/embed.js");

  scriptUrl.searchParams.set(
    "api_key",
    process.env.NEXT_PUBLIC_IFRAMELY_API_KEY
  );
  scriptUrl.searchParams.set("theme", resolvedTheme ?? "light");

  return <Script async src={scriptUrl.toString()} />;
};

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    disableTransitionOnChange
    enableSystem
    {...properties}
  >
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
    <ProgressBar
      color={colors.violet}
      height="2px"
      options={{ showSpinner: false }}
      shallowRouting
    />
    <IframelyEmbed />
  </NextThemesProvider>
);
