'use client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { createFuse } from '@repo/lib/fuse';
import {
  ArrowDownUpIcon,
  CalendarClockIcon,
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  FileQuestion,
  HashIcon,
  LetterTextIcon,
  ListIcon,
  ShieldIcon,
  TimerIcon,
  UsersIcon,
} from 'lucide-react';
import { useState } from 'react';

type JiraFieldMappingPickerProps = {
  acceptedTypes: string[];
  options: {
    type: string;
    label: string;
    value: string;
  }[];
  defaultValue: string[];
  onChange: (values: string[]) => void;
};

const getIcon = (type: JiraFieldMappingPickerProps['options'][0]['type']) => {
  switch (type) {
    case 'number':
      return HashIcon;
    case 'date':
      return CalendarIcon;
    case 'datetime':
      return CalendarClockIcon;
    case 'array':
      return ListIcon;
    case 'option':
      return ArrowDownUpIcon;
    case 'securitylevel':
      return ShieldIcon;
    case 'team':
      return UsersIcon;
    case 'timetracking':
      return TimerIcon;
    case 'string':
      return LetterTextIcon;
    default:
      return FileQuestion;
  }
};

const supportedTypes = ['number', 'date', 'datetime', 'string'];

export const JiraFieldMappingPicker = ({
  acceptedTypes,
  options,
  defaultValue,
  onChange,
}: JiraFieldMappingPickerProps) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(defaultValue);
  const fuse = createFuse(options, ['label']);

  const handleSelect = (newValue: string) => {
    let newValues = [...values];

    if (newValues.includes(newValue)) {
      newValues = newValues.filter((value) => value !== newValue);
    } else {
      newValues.push(newValue);
    }

    setValues(newValues);
    onChange(newValues);
  };

  const filterByFuse = (currentValue: string, search: string) => {
    return fuse
      .search(search)
      .find((result) => result.item.value === currentValue)
      ? 1
      : 0;
  };

  const selectedValues = options.filter((option) =>
    values.includes(option.value)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={options.length === 0}
        >
          {selectedValues.length ? (
            <span className="-ml-3 flex gap-1 overflow-hidden">
              {selectedValues.map((option) => {
                const Icon = getIcon(option.type);

                return (
                  <span
                    key={option.value}
                    className="inline-flex shrink-0 items-center gap-2 rounded border border-border/50 bg-card px-2 py-1 text-xs"
                  >
                    <Icon size={16} className="text-muted-foreground" />
                    {option.label}
                  </span>
                );
              })}
            </span>
          ) : (
            'Select Jira fields...'
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[308px] p-0">
        <Command filter={filterByFuse}>
          <CommandInput placeholder="Search Jira fields..." className="h-9" />
          <CommandList>
            <CommandEmpty>No Jira fields found.</CommandEmpty>
            <CommandGroup>
              {options
                .sort((optionA, optionB) =>
                  optionA.label.localeCompare(optionB.label)
                )
                .map((option) => {
                  const Icon = getIcon(option.type);

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
                      disabled={
                        !supportedTypes.includes(option.type) ||
                        !acceptedTypes.includes(option.type)
                      }
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon size={16} className="text-muted-foreground" />
                        <span>{option.label}</span>
                      </span>
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          values.includes(option.value)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
