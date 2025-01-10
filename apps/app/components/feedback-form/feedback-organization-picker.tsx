import type { FeedbackUser } from '@prisma/client';
import { Avatar } from '@repo/design-system/components/precomposed/avatar';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { handleError } from '@repo/design-system/lib/handle-error';
import { createFuse } from '@repo/lib/fuse';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { UserCommandItem } from '../user-command-item';
import { addOrganizationToUser } from './add-organization-to-user';
import { CreateFeedbackOrganizationForm } from './create-feedback-organization-form';

type FeedbackOrganizationPickerProperties = {
  readonly organizationsData: {
    readonly value: string;
    readonly label: string;
    readonly image: string;
  }[];
  readonly value: string | null;
  readonly onChange: (value: string) => void;
  readonly feedbackUser: FeedbackUser['id'];
};

export const FeedbackOrganizationPicker = ({
  organizationsData,
  value,
  onChange,
  feedbackUser,
}: FeedbackOrganizationPickerProperties) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const active = organizationsData.find((item) => item.value === value);
  const organizationsFuse = createFuse(organizationsData, ['label']);

  const filteredOrganizations = search
    ? organizationsFuse.search(search).map((item) => item.item)
    : organizationsData;

  const onSelect = async (newValue: string) => {
    setOpen(false);

    try {
      const { error } = await addOrganizationToUser({
        feedbackUser,
        feedbackOrganization: newValue,
      });

      if (error) {
        throw new Error(error);
      }

      onChange(newValue);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Select an organization"
      description="Select a organization to assign this user to."
      trigger={
        <Button variant="secondary" aria-expanded={open} size="sm">
          {active ? (
            <div className="flex items-center gap-2">
              <Avatar
                size={16}
                src={active.image}
                fallback={active.label.slice(0, 2)}
              />
              <p className="max-w-[5rem] truncate text-foreground">
                {active.label}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-muted-foreground" />
              <p className="text-muted-foreground">Select company...</p>
            </div>
          )}
        </Button>
      }
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search company..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandEmpty>No company found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <UserCommandItem
              user={{
                value: '',
                label: 'No company',
                image: '',
              }}
              onSelect={onSelect}
              value={value}
            />
            <Popover>
              <PopoverTrigger className="w-full">
                <CommandItem key="add-user" className="flex items-center gap-2">
                  <CheckIcon size={16} className="opacity-0" />
                  <PlusCircleIcon size={16} className="text-muted-foreground" />
                  Add a new company
                </CommandItem>
              </PopoverTrigger>
              <PopoverContent>
                <CreateFeedbackOrganizationForm
                  onChange={onSelect}
                  feedbackUser={feedbackUser}
                />
              </PopoverContent>
            </Popover>
          </CommandGroup>
          <CommandGroup heading="Companies">
            {filteredOrganizations.map((company) => (
              <UserCommandItem
                key={company.value}
                user={company}
                onSelect={onSelect}
                value={value}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </Dialog>
  );
};
