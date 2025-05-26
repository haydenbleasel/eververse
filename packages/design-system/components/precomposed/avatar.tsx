import * as AvatarComponent from '../ui/avatar';

type AvatarProps = {
  size?: number;
  src?: string;
  fallback?: string;
};

export const Avatar = ({ size = 24, src, fallback }: AvatarProps) => (
  <AvatarComponent.Avatar
    className="shrink-0 overflow-hidden rounded-full"
    style={{
      width: size,
      height: size,
    }}
  >
    <AvatarComponent.AvatarImage
      src={src}
      className="aspect-square h-full w-full object-cover"
      alt=""
      width={size}
      height={size}
    />
    <AvatarComponent.AvatarFallback
      style={{ fontSize: size / 2 }}
      className="border bg-primary text-primary-foreground"
    >
      {fallback ?? '??'}
    </AvatarComponent.AvatarFallback>
  </AvatarComponent.Avatar>
);
