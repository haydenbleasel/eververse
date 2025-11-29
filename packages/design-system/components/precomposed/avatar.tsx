// biome-ignore lint/performance/noNamespaceImport: we're using the primitive component
import * as AvatarComponent from "../ui/avatar";

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
      alt=""
      className="aspect-square h-full w-full object-cover"
      height={size}
      src={src}
      width={size}
    />
    <AvatarComponent.AvatarFallback
      className="border bg-primary text-primary-foreground"
      style={{ fontSize: size / 2 }}
    >
      {fallback ?? "??"}
    </AvatarComponent.AvatarFallback>
  </AvatarComponent.Avatar>
);
