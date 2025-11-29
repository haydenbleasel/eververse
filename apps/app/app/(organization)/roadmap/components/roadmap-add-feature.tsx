"use client";

import type { Feature, FeatureStatus } from "@repo/backend/prisma/client";
import type { DateRange } from "@repo/design-system/components/precomposed/calendar";
import { Calendar } from "@repo/design-system/components/precomposed/calendar";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Button } from "@repo/design-system/components/ui/button";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { cn } from "@repo/design-system/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { updateFeature } from "@/actions/feature/update";

type RoadmapAddFeatureProperties = {
  readonly features: (Pick<Feature, "id" | "title"> & {
    readonly status: Pick<FeatureStatus, "color">;
  })[];
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly defaultValue: Date | undefined;
};

export const RoadmapAddFeature = ({
  features,
  open,
  setOpen,
  defaultValue,
}: RoadmapAddFeatureProperties) => {
  const [_featureIdOpen, setFeatureIdOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [featureId, setFeatureId] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const disabled = loading || !featureId || !date?.from;

  useEffect(() => {
    if (open && defaultValue) {
      setDate({
        from: defaultValue,
        to: undefined,
      });
    }
  }, [open, defaultValue]);

  const onClick = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateFeature(featureId, {
        startAt: date.from ?? null,
        endAt: date.to ?? null,
      });

      if (error) {
        throw new Error(error);
      }

      toast.success("Feature added to roadmap!");
      setOpen(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setFeatureId(id);
    setFeatureIdOpen(false);
  };

  return (
    <Dialog
      cta="Add Feature"
      description="Add a feature to the roadmap by selecting a feature and setting a timeframe."
      disabled={disabled}
      modal={false}
      onClick={onClick}
      onOpenChange={setOpen}
      open={open}
      title="Add Feature to Roadmap"
    >
      <div className="space-y-4">
        <Select
          data={features.map((feature) => ({
            label: feature.title,
            value: feature.id,
          }))}
          key={featureId}
          label="Feature"
          onChange={handleSelect}
          renderItem={(item) => {
            const feature = features.find(({ id }) => id === item.value);

            if (!feature) {
              return null;
            }

            return (
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: feature.status.color }}
                />
                <span className="flex-1 truncate">{feature.title}</span>
              </div>
            );
          }}
          value={featureId}
        />

        <div className="space-y-1.5">
          <Label htmlFor="date">Timeframe</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "flex w-full items-center justify-start gap-2 text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                id="date"
                variant="outline"
              >
                <CalendarIcon size={16} />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} to{" "}
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
                onSelect={setDate}
                selected={date}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Dialog>
  );
};
