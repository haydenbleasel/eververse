import { env } from '@/env';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import type { ComponentProps } from 'react';

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
  const imageUrl = src ? new URL(src, 'https://img.logo.dev/') : undefined;

  if (imageUrl) {
    imageUrl.searchParams.set('token', env.NEXT_PUBLIC_LOGO_DEV_API_KEY);
    imageUrl.searchParams.set('size', (size * 2).toString());
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
        src={imageUrl?.toString()}
        className="aspect-square h-full w-full object-cover"
        alt=""
        width={size}
        height={size}
      />
      <AvatarFallback
        style={{ fontSize: size / 2 }}
        className="border bg-background"
      >
        {fallback ?? '??'}
      </AvatarFallback>
    </Avatar>
  );
};
