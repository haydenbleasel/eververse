'use client';

import { updateRelease } from '@/actions/release/update';
import type { Release } from '@prisma/client';
import {
  Calendar,
  type DateRange,
} from '@repo/design-system/components/precomposed/calendar';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

type ReleaseDatePickerProps = {
  releaseId: Release['id'];
  defaultStartAt: Release['startAt'] | null;
  defaultEndAt: Release['endAt'] | null;
  disabled?: boolean;
};

export const ReleaseDatePicker = ({
  releaseId,
  defaultStartAt,
  defaultEndAt,
  disabled,
}: ReleaseDatePickerProps) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: defaultStartAt ?? undefined,
    to: defaultEndAt ?? undefined,
  });

  const handleDateChange = async (date: DateRange | undefined) => {
    setDate(date);

    try {
      const response = await updateRelease(releaseId, {
        startAt: date?.from,
        endAt: date?.to,
      });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            'flex w-full items-center justify-start gap-2 text-left font-normal',
            !date && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon size={16} />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} to{' '}
                {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        collisionPadding={12}
      >
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};
