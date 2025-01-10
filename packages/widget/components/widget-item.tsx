import { formatDate } from '@repo/lib/format';
import { ExternalLinkIcon } from 'lucide-react';
import type dynamicIconImports from 'lucide-react/dynamicIconImports';
import { DynamicIcon } from './dynamic-icon';

export type WidgetItemProperties = {
  readonly icon?: string;
  readonly id: string;
  readonly title: string;
  readonly link: string;
  readonly date?: Date;
};

export const WidgetItem = ({
  id,
  link,
  title,
  date,
  icon,
}: WidgetItemProperties) => (
  <a
    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary"
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    key={id}
  >
    {icon ? (
      <DynamicIcon
        name={icon as keyof typeof dynamicIconImports}
        size={16}
        className="shrink-0 text-muted-foreground"
      />
    ) : null}
    <p className="flex-1 truncate font-medium text-foreground text-sm">
      {title}
    </p>
    {date ? (
      <p className="shrink-0 text-muted-foreground text-xs">
        {formatDate(date)}
      </p>
    ) : (
      <ExternalLinkIcon size={16} className="shrink-0 text-muted-foreground" />
    )}
  </a>
);
