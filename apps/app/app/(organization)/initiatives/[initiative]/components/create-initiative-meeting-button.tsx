"use client";

import type { Initiative } from "@repo/backend/prisma/client";
import { Calendar } from "@repo/design-system/components/precomposed/calendar";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/design-system/components/ui/radio-group";
import { handleError } from "@repo/design-system/lib/handle-error";
import { cn } from "@repo/design-system/lib/utils";
import { formatDate } from "@repo/lib/format";
import {
  AudioLinesIcon,
  CalendarIcon,
  LanguagesIcon,
  PlusIcon,
  VideoIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createInitiativePage } from "@/actions/initiative-page/create";

type CreateInitiativeMeetingButtonProperties = {
  readonly initiativeId: Initiative["id"];
};

const types = [
  {
    id: "text",
    label: "Text",
    description: "Write your meeting notes in a text editor.",
    icon: LanguagesIcon,
  },
  {
    id: "audio",
    label: "Audio",
    description: "Upload an audio file and transcribe it with AI.",
    icon: AudioLinesIcon,
  },
  {
    id: "video",
    label: "Video",
    description: "Upload a video file and transcribe it with AI.",
    icon: VideoIcon,
  },
];

export const CreateInitiativeMeetingButton = ({
  initiativeId,
}: CreateInitiativeMeetingButtonProperties) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
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

      if ("error" in response) {
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
      className="sm:max-w-2xl"
      cta="Create meeting"
      description="Keep track of your meetings with customers and stakeholders."
      disabled={disabled}
      onClick={onClick}
      onOpenChange={setOpen}
      open={open}
      title="Add a new meeting"
      trigger={
        <div>
          <Tooltip content="Create a new meeting">
            <Button className="-m-1.5 h-6 w-6" size="icon" variant="ghost">
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
          onChangeText={setTitle}
          placeholder="Meeting with the team"
          required
          value={title}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !meetingAt && "text-muted-foreground"
                )}
                id="date"
                name="date"
                variant="outline"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {meetingAt ? formatDate(meetingAt) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                initialFocus
                mode="single"
                numberOfMonths={2}
                onSelect={setMeetingAt}
                selected={meetingAt}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Type</Label>
          <RadioGroup
            className="grid w-full grid-cols-3 gap-4"
            onValueChange={setType}
            value={type}
          >
            {types.map((option) => (
              <div
                className={cn(
                  "space-y-2 rounded border p-4",
                  option.id === type ? "bg-secondary" : "bg-background"
                )}
                key={option.id}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id={option.id} value={option.id} />
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
