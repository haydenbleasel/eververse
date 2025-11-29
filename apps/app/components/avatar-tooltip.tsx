import { Avatar } from "@repo/design-system/components/precomposed/avatar";
import type { TooltipProperties } from "@repo/design-system/components/precomposed/tooltip";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";

type AvatarTooltipProperties = {
  readonly src?: string | undefined;
  readonly fallback: string;
  readonly title: string;
  readonly subtitle: string;
  readonly size?: number;
  readonly align?: TooltipProperties["align"];
  readonly side?: TooltipProperties["side"];
};

export const AvatarTooltip = ({
  src,
  fallback,
  title,
  subtitle,
  size = 24,
  align,
  side,
}: AvatarTooltipProperties) => (
  <Tooltip
    align={align}
    content={
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    }
    side={side}
  >
    <Avatar fallback={fallback} size={size} src={src} />
  </Tooltip>
);
