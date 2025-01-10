import { cn } from '@repo/design-system/lib/utils';

type SuggestionListProperties = {
  readonly items: string[];
  readonly selected: number;
  readonly onSelect: (index: number) => void;
  readonly render?: (item: string) => string;
};

const itemClassName = cn(
  'flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm',
  'text-foreground'
);

export const SuggestionList = ({
  selected,
  onSelect,
  items,
  render,
}: SuggestionListProperties) => (
  <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-backdrop/90 p-1 shadow-md backdrop-blur-sm transition-all">
    {items.length > 0 ? (
      items.map((item, index) => (
        <button
          type="button"
          className={cn(
            itemClassName,
            index === selected && 'bg-card text-foreground',
            'hover:bg-card'
          )}
          key={index}
          onClick={() => onSelect(index)}
        >
          {render ? render(item) : item}
        </button>
      ))
    ) : (
      <div className={itemClassName}>No results found</div>
    )}
  </div>
);
