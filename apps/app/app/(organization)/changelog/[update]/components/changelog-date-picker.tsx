'use client';

import { updateChangelog } from '@/actions/changelog/update';
import type { Changelog } from '@prisma/client';
import { Calendar } from '@repo/design-system/components/precomposed/calendar';
import type { SelectSingleEventHandler } from '@repo/design-system/components/precomposed/calendar';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { handleError } from '@repo/design-system/lib/handle-error';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

type ChangelogDatePickerProperties = {
  readonly changelogId: Changelog['id'];
  readonly defaultPublishAt: Changelog['publishAt'];
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
            id="date"
            variant="outline"
            className="justify-start text-left font-normal"
            disabled={disabled}
          >
            <CalendarIcon size={16} className="mr-2" />
            {format(date, 'LLL dd, y')}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          collisionPadding={12}
          className="w-auto p-0"
        >
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
