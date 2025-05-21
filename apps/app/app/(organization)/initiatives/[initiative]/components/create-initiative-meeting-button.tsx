'use client';

import { createInitiativePage } from '@/actions/initiative-page/create';
import type { Initiative } from '@repo/backend/prisma/client';
import { Calendar } from '@repo/design-system/components/precomposed/calendar';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import {
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components/ui/radio-group';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { formatDate } from '@repo/lib/format';
import {
  AudioLinesIcon,
  CalendarIcon,
  LanguagesIcon,
  PlusIcon,
  VideoIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CreateInitiativeMeetingButtonProperties = {
  readonly initiativeId: Initiative['id'];
};

const types = [
  {
    id: 'text',
    label: 'Text',
    description: 'Write your meeting notes in a text editor.',
    icon: LanguagesIcon,
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Upload an audio file and transcribe it with AI.',
    icon: AudioLinesIcon,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Upload a video file and transcribe it with AI.',
    icon: VideoIcon,
  },
];

export const CreateInitiativeMeetingButton = ({
  initiativeId,
}: CreateInitiativeMeetingButtonProperties) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(types[0].id);
  const disabled = loading || !title.trim();
  const router = useRouter();
  const [meetingAt, setMeetingAt] = useState<Date | undefined>(new Date());

  const onClick = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const response = await createInitiativePage(initiativeId, title, type);

      if ('error' in response) {
        throw new Error(response.error);
      }

      setOpen(false);
      router.push(`/initiatives/${initiativeId}/${response.id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Add a new meeting"
      description="Keep track of your meetings with customers and stakeholders."
      onClick={onClick}
      cta="Create meeting"
      disabled={disabled}
      className="max-w-2xl"
      trigger={
        <div>
          <Tooltip content="Create a new meeting">
            <Button size="icon" variant="ghost" className="-m-1.5 h-6 w-6">
              <PlusIcon size={16} />
              <span className="sr-only">Create meeting</span>
            </Button>
          </Tooltip>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Title"
          name="title"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="Meeting with the team"
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                name="date"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !meetingAt && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {meetingAt ? formatDate(meetingAt) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={meetingAt}
                onSelect={setMeetingAt}
                initialFocus
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Type</Label>
          <RadioGroup
            className="grid w-full grid-cols-3 gap-4"
            value={type}
            onValueChange={setType}
          >
            {types.map((option) => (
              <div
                key={option.id}
                className={cn(
                  'space-y-2 rounded border p-4',
                  option.id === type ? 'bg-secondary' : 'bg-background'
                )}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id}>{option.label}</Label>
                </div>
                <p className="text-muted-foreground text-sm">
                  {option.description}
                </p>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </Dialog>
  );
};
