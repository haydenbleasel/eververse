'use client';

import { createInitiativePage } from '@/actions/initiative-page/create';
import type { Initiative } from '@prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components/ui/radio-group';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type CreateInitiativePageButtonProperties = {
  readonly initiativeId: Initiative['id'];
};

const types = [
  {
    id: 'document',
    label: 'Document',
    description: 'A document is a great way to write up long-form content.',
  },
  {
    id: 'canvas',
    label: 'Canvas',
    description: 'A canvas is a great way to explore ideas more visually.',
  },
];

export const CreateInitiativePageButton = ({
  initiativeId,
}: CreateInitiativePageButtonProperties) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(types[0].id);
  const disabled = loading || !title.trim();
  const router = useRouter();

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
      title="Create a new page"
      description="Pages are a great way to organize your content. You can add multiple pages to an initiative."
      onClick={onClick}
      cta="Create page"
      disabled={disabled}
      trigger={
        <div>
          <Tooltip content="Create a new page">
            <Button size="icon" variant="ghost" className="-m-1.5 h-6 w-6">
              <PlusIcon size={16} />
              <span className="sr-only">Create page</span>
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
          placeholder="Early access program"
        />

        <div className="space-y-1.5">
          <Label htmlFor="title">Type</Label>
          <RadioGroup
            className="grid w-full grid-cols-2 gap-4"
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
