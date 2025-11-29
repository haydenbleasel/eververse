import type { FeedbackUser } from "@repo/backend/prisma/client";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/design-system/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { handleError } from "@repo/design-system/lib/handle-error";
import { createFuse } from "@repo/lib/fuse";
import { CheckIcon, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { CompanyLogo } from "@/app/(organization)/components/company-logo";
import { UserCommandItem } from "../user-command-item";
import { addOrganizationToUser } from "./add-organization-to-user";
import { CreateFeedbackOrganizationForm } from "./create-feedback-organization-form";

type FeedbackOrganizationPickerProperties = {
  readonly organizationsData: {
    readonly value: string;
    readonly label: string;
    readonly image: string | null;
  }[];
  readonly value: string | null;
  readonly onChange: (value: string) => void;
  readonly feedbackUser: FeedbackUser["id"];
};

export const FeedbackOrganizationPicker = ({
  organizationsData,
  value,
  onChange,
  feedbackUser,
}: FeedbackOrganizationPickerProperties) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const active = organizationsData.find((item) => item.value === value);
  const organizationsFuse = createFuse(organizationsData, ["label"]);

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
      description="Select a organization to assign this user to."
      onOpenChange={setOpen}
      open={open}
      title="Select an organization"
      trigger={
        <Button aria-expanded={open} size="sm" variant="secondary">
          {active ? (
            <div className="flex items-center gap-2">
              <CompanyLogo
                fallback={active.label.slice(0, 2)}
                size={16}
                src={active.image}
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
          onValueChange={setSearch}
          placeholder="Search company..."
          value={search}
        />
        <CommandEmpty>No company found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <UserCommandItem
              onSelect={onSelect}
              user={{
                value: "",
                label: "No company",
                image: "",
              }}
              value={value}
            />
            <Popover>
              <PopoverTrigger className="w-full">
                <CommandItem className="flex items-center gap-2" key="add-user">
                  <CheckIcon className="opacity-0" size={16} />
                  <PlusCircleIcon className="text-muted-foreground" size={16} />
                  Add a new company
                </CommandItem>
              </PopoverTrigger>
              <PopoverContent>
                <CreateFeedbackOrganizationForm
                  feedbackUser={feedbackUser}
                  onChange={onSelect}
                />
              </PopoverContent>
            </Popover>
          </CommandGroup>
          <CommandGroup heading="Companies">
            {filteredOrganizations.map((company) => (
              <UserCommandItem
                key={company.value}
                onSelect={onSelect}
                user={company}
                value={value}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </Dialog>
  );
};
