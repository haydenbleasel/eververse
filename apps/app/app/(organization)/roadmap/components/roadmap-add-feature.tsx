'use client';

import { updateFeature } from '@/actions/feature/update';
import type { Feature, FeatureStatus } from '@prisma/client';
import { Calendar } from '@repo/design-system/components/precomposed/calendar';
import type { DateRange } from '@repo/design-system/components/precomposed/calendar';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Select } from '@repo/design-system/components/precomposed/select';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { cn } from '@repo/design-system/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';

type RoadmapAddFeatureProperties = {
  readonly features: (Pick<Feature, 'id' | 'title'> & {
    readonly status: Pick<FeatureStatus, 'color'>;
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
  const [featureId, setFeatureId] = useState('');
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

      toast.success('Feature added to roadmap!');
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
      open={open}
      onOpenChange={setOpen}
      title="Add Feature to Roadmap"
      description="Add a feature to the roadmap by selecting a feature and setting a timeframe."
      onClick={onClick}
      disabled={disabled}
      cta="Add Feature"
      modal={false}
    >
      <div className="space-y-4">
        <Select
          label="Feature"
          value={featureId}
          onChange={handleSelect}
          data={features.map((feature) => ({
            label: feature.title,
            value: feature.id,
          }))}
          key={featureId}
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
        />

        <div className="space-y-1.5">
          <Label htmlFor="date">Timeframe</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  'flex w-full items-center justify-start gap-2 text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
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
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Dialog>
  );
};
