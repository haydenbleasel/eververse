"use client";

import type { Changelog } from "@repo/backend/prisma/client";
import type { SelectSingleEventHandler } from "@repo/design-system/components/precomposed/calendar";
import { Calendar } from "@repo/design-system/components/precomposed/calendar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { handleError } from "@repo/design-system/lib/handle-error";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { updateChangelog } from "@/actions/changelog/update";

type ChangelogDatePickerProperties = {
  readonly changelogId: Changelog["id"];
  readonly defaultPublishAt: Changelog["publishAt"];
  readonly disabled: boolean;
};

export const ChangelogDatePicker = ({
  changelogId,
  defaultPublishAt,
  disabled,
}: ChangelogDatePickerProperties) => {
  const [date, setDate] = useState<Date>(defaultPublishAt);

  const handleDateChange: SelectSingleEventHandler = async (newDate) => {
    if (!newDate) {
      return;
    }

    setDate(newDate);

    try {
      const { error } = await updateChangelog(changelogId, {
        publishAt: newDate,
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="justify-start text-left font-normal"
            disabled={disabled}
            id="date"
            variant="outline"
          >
            <CalendarIcon className="mr-2" size={16} />
            {format(date, "LLL dd, y")}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0"
          collisionPadding={12}
        >
          <Calendar
            defaultMonth={date}
            initialFocus
            mode="single"
            numberOfMonths={1}
            onSelect={handleDateChange}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
