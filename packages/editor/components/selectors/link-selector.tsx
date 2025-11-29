import { Button } from "@repo/design-system/components/ui/button";
import { PopoverContent } from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import { Check, ExternalLinkIcon, Trash } from "lucide-react";
import { useEditor } from "novel";
import { Popover } from "radix-ui";
import type { FormEventHandler } from "react";
import { useEffect, useRef, useState } from "react";

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
    if (text.includes(".") && !text.includes(" ")) {
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
  const [url, setUrl] = useState<string>("");
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

  const defaultValue = (editor.getAttributes("link") as { href?: string }).href;

  return (
    <Popover.Root modal onOpenChange={onOpenChange} open={open}>
      <Popover.Trigger asChild>
        <Button className="gap-2 rounded-none border-none" variant="ghost">
          <ExternalLinkIcon className="h-4 w-4" />
          <p
            className={cn(
              "underline decoration-text-muted underline-offset-4",
              {
                "text-primary": editor.isActive("link"),
              }
            )}
          >
            Link
          </p>
        </Button>
      </Popover.Trigger>
      <PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
        <form className="flex p-1" onSubmit={handleSubmit}>
          <input
            aria-label="Link URL"
            className="flex-1 bg-background p-1 text-sm outline-none"
            defaultValue={defaultValue ?? ""}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a link"
            ref={inputReference}
            type="text"
            value={url}
          />
          {editor.getAttributes("link").href ? (
            <Button
              className="flex h-8 items-center rounded-sm p-1 text-destructive transition-all hover:bg-destructive-foreground dark:hover:bg-destructive"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                onOpenChange(false);
              }}
              size="icon"
              type="button"
              variant="outline"
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="h-8" size="icon" variant="secondary">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover.Root>
  );
};
