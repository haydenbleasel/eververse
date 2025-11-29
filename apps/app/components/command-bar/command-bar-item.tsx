import { CommandItem } from "@repo/design-system/components/ui/command";
import type { PiIcon } from "lucide-react";
import { useCommandBar } from "./use-command-bar";

type CommandBarItemProperties = {
  readonly label: string;
  readonly onSelect: () => void;
  readonly icon: typeof PiIcon;
};

export const CommandBarItem = ({
  label,
  onSelect,
  icon: Icon,
}: CommandBarItemProperties) => {
  const { hide } = useCommandBar();

  const handleSelect = () => {
    hide();
    onSelect();
  };

  return (
    <CommandItem
      className="flex cursor-pointer items-center gap-3 rounded"
      onSelect={handleSelect}
    >
      <Icon className="text-muted-foreground" size={16} />
      <span>{label}</span>
    </CommandItem>
  );
};
