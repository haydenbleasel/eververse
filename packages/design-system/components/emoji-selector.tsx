'use client';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { init } from 'emoji-mart';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Emoji } from './emoji';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type EmojiSelectorProperties = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onError: (error: unknown) => void;
  readonly large?: boolean;
};

export const EmojiSelector = ({
  value,
  onChange,
  onError,
  large,
}: EmojiSelectorProperties) => {
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      return;
    }

    init({ data })
      .then(() => setReady(true))
      .catch(onError);
  }, [onError, ready]);

  if (!ready) {
    return null;
  }

  const handleEmojiSelect = (newEmoji: { id: string }) => {
    onChange(newEmoji.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Select an emoji"
          className={cn(
            'flex items-center justify-center',
            large ? 'h-12 w-12' : 'h-4 w-4'
          )}
        >
          <Emoji id={value} size={large ? '1.5rem' : '0.825rem'} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[352] p-0" collisionPadding={16}>
        <Picker
          data={data}
          onEmojiSelect={handleEmojiSelect}
          previewPosition="none"
          skinTonePosition="none"
          theme={resolvedTheme}
        />
      </PopoverContent>
    </Popover>
  );
};
