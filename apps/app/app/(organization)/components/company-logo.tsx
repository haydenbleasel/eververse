import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import type { ComponentProps } from "react";
import { env } from "@/env";

type CompanyLogoProps = ComponentProps<typeof Avatar> & {
  src: string | null | undefined;
  fallback?: string;
  size?: number;
};

export const CompanyLogo = ({
  src,
  size = 20,
  fallback,
  ...props
}: CompanyLogoProps) => {
  const imageUrl = src ? new URL(src, "https://img.logo.dev/") : undefined;

  if (imageUrl) {
    imageUrl.searchParams.set("token", env.NEXT_PUBLIC_LOGO_DEV_API_KEY);
    imageUrl.searchParams.set("size", (size * 2).toString());
  }

  return (
    <Avatar
      className="shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
      }}
      {...props}
    >
      <AvatarImage
        alt=""
        className="aspect-square h-full w-full object-cover"
        height={size}
        src={imageUrl?.toString()}
        width={size}
      />
      <AvatarFallback
        className="border bg-background"
        style={{ fontSize: size / 2 }}
      >
        {fallback ?? "??"}
      </AvatarFallback>
    </Avatar>
  );
};
