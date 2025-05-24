'use client';

import { createRelease } from '@/actions/release/create';
import { Calendar } from '@repo/design-system/components/precomposed/calendar';
import type { DateRange } from '@repo/design-system/components/precomposed/calendar';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { QueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { KeyboardEventHandler } from 'react';
import { useState } from 'react';
import { useReleaseForm } from './use-release-form';

export const ReleaseForm = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [loading, setLoading] = useState(false);
  const disabled = !name.trim() || loading;
  const { isOpen, toggle, hide } = useReleaseForm();
  const queryClient = new QueryClient();
  const router = useRouter();

  const handleCreate = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { id, error } = await createRelease(name, date?.from, date?.to);

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error('Something went wrong');
      }

      setName('');

      hide();

      await queryClient.invalidateQueries({ queryKey: ['release'] });

      router.push(`/releases/${id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={toggle}
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create a release
        </p>
      }
      cta="Create release"
      onClick={handleCreate}
      disabled={disabled}
      className="sm:max-w-xl"
      modal={false}
      footer={
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
      }
    >
      <Input
        placeholder="Release 1.1"
        value={name}
        onChangeText={setName}
        className="border-none p-0 font-medium shadow-none focus-visible:ring-0 md:text-lg"
        maxLength={191}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
    </Dialog>
  );
};
