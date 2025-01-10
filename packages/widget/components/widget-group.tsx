import { WidgetItem } from './widget-item';
import type { WidgetItemProperties } from './widget-item';

export type WidgetGroupProperties = {
  readonly title: string;
  readonly items: WidgetItemProperties[];
};

export const WidgetGroup = ({ title, items }: WidgetGroupProperties) => (
  <div className="p-4">
    <p className="font-medium text-muted-foreground text-sm">{title}</p>
    <div className="-mx-2 mt-2">
      {items.map((item) => (
        <WidgetItem {...item} key={item.id} />
      ))}
    </div>
  </div>
);
