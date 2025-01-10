import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { Button } from '@repo/design-system/components/ui/button';
import { PopoverContent } from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { Check, ExternalLinkIcon, Trash } from 'lucide-react';
import { useEditor } from 'novel';
import { useEffect, useRef, useState } from 'react';
import type { FormEventHandler } from 'react';

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getUrlFromString = (text: string): string | null => {
  if (isValidUrl(text)) {
    return text;
  }
  try {
    if (text.includes('.') && !text.includes(' ')) {
      return new URL(`https://${text}`).toString();
    }

    return null;
  } catch {
    return null;
  }
};

type LinkSelectorProperties = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const LinkSelector = ({
  open,
  onOpenChange,
}: LinkSelectorProperties) => {
  const [url, setUrl] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);
  const { editor } = useEditor();

  useEffect(() => {
    inputReference.current?.focus();
  }, []);

  if (!editor) {
    return null;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const href = getUrlFromString(url);

    if (href) {
      editor.chain().focus().setLink({ href }).run();
      onOpenChange(false);
    }
  };

  const defaultValue = (editor.getAttributes('link') as { href?: string }).href;

  return (
    <Popover modal open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="gap-2 rounded-none border-none">
          <ExternalLinkIcon className="h-4 w-4" />
          <p
            className={cn(
              'underline decoration-text-muted underline-offset-4',
              {
                'text-primary': editor.isActive('link'),
              }
            )}
          >
            Link
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
        <form onSubmit={handleSubmit} className="flex p-1">
          <input
            aria-label="Link URL"
            ref={inputReference}
            type="text"
            placeholder="Paste a link"
            className="flex-1 bg-background p-1 text-sm outline-none"
            defaultValue={defaultValue ?? ''}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          {editor.getAttributes('link').href ? (
            <Button
              size="icon"
              variant="outline"
              type="button"
              className="flex h-8 items-center rounded-sm p-1 text-destructive transition-all hover:bg-destructive-foreground dark:hover:bg-destructive"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                onOpenChange(false);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" variant="secondary" className="h-8">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};
