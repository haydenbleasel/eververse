"use client";

import type { Feature } from "@repo/backend/prisma/client";
import type {
  DateRange,
  SelectRangeEventHandler,
} from "@repo/design-system/components/precomposed/calendar";
import { Calendar } from "@repo/design-system/components/precomposed/calendar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { handleError } from "@repo/design-system/lib/handle-error";
import { cn } from "@repo/design-system/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { updateFeature } from "@/actions/feature/update";

type FeatureDateRangePickerProperties = {
  readonly featureId: Feature["id"];
  readonly defaultStartAt: Feature["startAt"];
  readonly defaultEndAt: Feature["endAt"];
  readonly disabled: boolean;
};

export const FeatureDateRangePicker = ({
  featureId,
  defaultStartAt,
  defaultEndAt,
  disabled,
}: FeatureDateRangePickerProperties) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: defaultStartAt ?? undefined,
    to: defaultEndAt ?? undefined,
  });

  const handleDateChange: SelectRangeEventHandler = async (
    newDate: DateRange | undefined
  ) => {
    setDate(newDate);

    if (!newDate) {
      return;
    }

    try {
      const { error } = await updateFeature(featureId, {
        startAt: newDate.from ?? null,
        endAt: newDate.to ?? null,
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
            className={cn(
              "flex items-center justify-start gap-2 text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
            id="date"
            variant="outline"
          >
            <CalendarIcon className="mr-2" size={16} />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0"
          collisionPadding={12}
        >
          <Calendar
            defaultMonth={date?.from}
            initialFocus
            mode="range"
            numberOfMonths={2}
            onSelect={handleDateChange}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
