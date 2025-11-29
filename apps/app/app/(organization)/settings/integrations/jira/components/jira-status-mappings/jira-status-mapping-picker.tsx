"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/design-system/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { colors } from "@repo/design-system/lib/colors";
import { cn } from "@repo/design-system/lib/utils";
import { createFuse } from "@repo/lib/fuse";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";

type JiraStatusMappingPickerProps = {
  options: {
    state: string | undefined;
    label: string;
    value: string;
  }[];
  defaultValue: string[];
  onChange: (values: string[]) => void;
};

const getStateColor = (
  state: JiraStatusMappingPickerProps["options"][number]["state"]
) => {
  if (state === "done") {
    return colors.emerald;
  }

  if (state === "indeterminate") {
    return colors.blue;
  }

  return colors.gray;
};

export const JiraStatusMappingPicker = ({
  options,
  defaultValue,
  onChange,
}: JiraStatusMappingPickerProps) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(defaultValue);
  const fuse = createFuse(options, ["label"]);

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

  const filterByFuse = (currentValue: string, search: string) =>
    fuse.search(search).find((result) => result.item.value === currentValue)
      ? 1
      : 0;

  const selectedValues = options.filter((option) =>
    values.includes(option.value)
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          disabled={options.length === 0}
          role="combobox"
          variant="outline"
        >
          {selectedValues.length ? (
            <span className="-ml-3 flex gap-1 overflow-hidden">
              {selectedValues.map((option) => (
                <span
                  className="inline-flex shrink-0 items-center gap-2 rounded border border-border/50 bg-card px-2 py-1 text-xs"
                  key={option.value}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getStateColor(option.state) }}
                  />
                  {option.label}
                </span>
              ))}
            </span>
          ) : (
            "Select Jira statuses..."
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[308px] p-0">
        <Command filter={filterByFuse}>
          <CommandInput className="h-9" placeholder="Search Jira statuses..." />
          <CommandList>
            <CommandEmpty>No Jira statuses found.</CommandEmpty>
            <CommandGroup>
              {options
                .sort((optionA, optionB) =>
                  optionA.label.localeCompare(optionB.label)
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={handleSelect}
                    value={option.value}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option.state && (
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: getStateColor(option.state),
                          }}
                        />
                      )}
                      <span>{option.label}</span>
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        values.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
