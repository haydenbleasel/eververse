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
import { createFuse } from '@repo/lib/fuse';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { UserCommandItem } from '../user-command-item';
import { CreateFeedbackUserForm } from './create-feedback-user-form';

type FeedbackUserPickerProperties = {
  readonly usersData: {
    readonly value: string;
    readonly label: string;
    readonly image: string | null;
    readonly email: string | null;
  }[];
  readonly value: string | null;
  readonly onChange: (value: string) => void;
};

export const FeedbackUserPicker = ({
  usersData,
  value,
  onChange,
}: FeedbackUserPickerProperties) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const active = usersData.find((item) => item.value === value);
  const usersFuse = createFuse(usersData, ['label', 'email']);
  const filteredUsers = search
    ? usersFuse.search(search).map((item) => item.item)
    : usersData;

  const handleUserSelect = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
  };

  const handleClearSelect = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Select a user"
      description="Who is this feedback from?"
      trigger={
        <Button variant="secondary" aria-expanded={open} size="sm">
          {active?.image ? (
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
              <p className="text-muted-foreground">Select a user</p>
            </div>
          )}
        </Button>
      }
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search user..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No user found.</CommandEmpty>
          <CommandGroup>
            <UserCommandItem
              user={{
                value: '',
                label: 'No user',
                image: '',
              }}
              onSelect={handleClearSelect}
              value={value}
            />
            <Popover>
              <PopoverTrigger className="w-full">
                <CommandItem key="add-user" className="flex items-center gap-2">
                  <CheckIcon size={16} className="opacity-0" />
                  <PlusCircleIcon size={16} className="text-muted-foreground" />
                  Add user
                </CommandItem>
              </PopoverTrigger>
              <PopoverContent>
                <CreateFeedbackUserForm onChange={handleUserSelect} />
              </PopoverContent>
            </Popover>
          </CommandGroup>
          <CommandGroup heading="Users">
            {filteredUsers.map((user) => (
              <UserCommandItem
                key={user.value}
                user={user}
                onSelect={handleUserSelect}
                value={value}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </Dialog>
  );
};
