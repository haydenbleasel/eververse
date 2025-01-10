import { Avatar } from '@repo/design-system/components/precomposed/avatar';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import type { TooltipProperties } from '@repo/design-system/components/precomposed/tooltip';

type AvatarTooltipProperties = {
  readonly src?: string | undefined;
  readonly fallback: string;
  readonly title: string;
  readonly subtitle: string;
  readonly size?: number;
  readonly align?: TooltipProperties['align'];
  readonly side?: TooltipProperties['side'];
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
    side={side}
    content={
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    }
  >
    <Avatar size={size} src={src} fallback={fallback} />
  </Tooltip>
);
