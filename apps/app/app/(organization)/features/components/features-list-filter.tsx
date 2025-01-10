import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { Separator } from '@repo/design-system/components/ui/separator';
import { cn } from '@repo/design-system/lib/utils';
import type { Column } from '@tanstack/react-table';
import { CheckIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Option = {
  label: string;
  value: string;
};

type FeaturesListFilterProperties<TData, TValue> = {
  readonly column?: Column<TData, TValue>;
  readonly title?: string;
  readonly options: Option[];
  readonly icon: typeof CheckIcon;
  readonly renderItem?: (item: Option) => ReactNode;
};

export const FeaturesListFilter = <TData, TValue>({
  column,
  title,
  options,
  icon: Icon,
  renderItem,
}: FeaturesListFilterProperties<TData, TValue>): ReactNode => {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex h-8 shrink-0 items-center gap-2 border-dashed"
        >
          <Icon size={16} className="shrink-0" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="flex items-center gap-1.5 rounded-sm px-1 font-normal"
                      >
                        {renderItem ? renderItem(option) : option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = [...selectedValues];
                      column?.setFilterValue(
                        filterValues.length > 0 ? filterValues : undefined
                      );
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-foreground',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4')} />
                    </div>
                    {renderItem ? renderItem(option) : option.label}
                    {facets?.get(option.value) ? (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-muted-foreground text-xs">
                        {facets.get(option.value)}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
