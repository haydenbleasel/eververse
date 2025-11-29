import { Avatar } from "@repo/design-system/components/precomposed/avatar";
import { CommandItem } from "@repo/design-system/components/ui/command";
import { cn } from "@repo/design-system/lib/utils";
import { CheckIcon } from "lucide-react";

type UserCommandItemProperties = {
  readonly user: {
    readonly value: string;
    readonly label: string;
    readonly image: string | null;
    readonly email?: string | null;
  };
  readonly value: string | null;
  readonly onSelect: (value: string) => void;
};

export const UserCommandItem = ({
  user,
  value,
  onSelect,
}: UserCommandItemProperties) => (
  <CommandItem
    className="flex items-center gap-2"
    key={user.value}
    onSelect={() => onSelect(user.value)}
    value={user.value}
  >
    <CheckIcon
      className={cn(
        "h-4 w-4",
        value === user.value ? "opacity-100" : "opacity-0"
      )}
    />
    {user.image ? (
      <Avatar fallback={user.label.slice(0, 2)} size={16} src={user.image} />
    ) : (
      <div className="h-4 w-4 rounded-full bg-muted-foreground" />
    )}
    <span className="truncate">{user.label}</span>
    {user.email ? (
      <span className="truncate text-muted-foreground">{user.email}</span>
    ) : null}
  </CommandItem>
);
