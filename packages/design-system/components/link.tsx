import NextLink from "next/link";
import type { ComponentProps } from "react";
import { forwardRef } from "react";

type LinkProperties = {
  readonly href: string;
  readonly children: ComponentProps<"a">["children"];
  readonly className?: string;
  readonly external?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProperties>(
  ({ href, external, ...properties }, reference) => {
    const isExternal = href.startsWith("http");

    if (isExternal) {
      return (
        <a
          href={href}
          rel="noopener noreferrer"
          target="_blank"
          {...properties}
          ref={reference}
        />
      );
    }

    return (
      <NextLink
        href={href}
        target={external ? "_blank" : undefined}
        {...properties}
        ref={reference}
      />
    );
  }
);
