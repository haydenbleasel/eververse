"use client";

import { useEventListener } from "@react-hookz/web";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@repo/design-system/components/ui/command";
import { useSidebar } from "@repo/design-system/components/ui/sidebar";
import { cn } from "@repo/design-system/lib/utils";
import {
  ArrowUpCircleIcon,
  BotMessageSquareIcon,
  ClockIcon,
  CodeIcon,
  CogIcon,
  CompassIcon,
  GridIcon,
  HomeIcon,
  ImportIcon,
  LinkIcon,
  MessageCircleIcon,
  PlusIcon,
  StarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useChangelogForm } from "../changelog-form/use-changelog-form";
import { useFeatureForm } from "../feature-form/use-feature-form";
import { useFeedbackForm } from "../feedback-form/use-feedback-form";
import { useGroupForm } from "../group-form/use-group-form";
import { useInitiativeForm } from "../initiative-form/use-initiative-form";
import { useProductForm } from "../product-form/use-product-form";
import { CommandBarItem } from "./command-bar-item";
import { useCommandBar } from "./use-command-bar";

type CommandBarProperties = {
  readonly hasProducts: boolean;
};

export const CommandBar = ({ hasProducts }: CommandBarProperties) => {
  const commandBar = useCommandBar();
  const feedbackForm = useFeedbackForm();
  const featureForm = useFeatureForm();
  const initiativeForm = useInitiativeForm();
  const productForm = useProductForm();
  const groupForm = useGroupForm();
  const changelogForm = useChangelogForm();
  const sidebar = useSidebar();
  const router = useRouter();

  useEventListener(
    typeof window === "undefined" ? null : window,
    "keydown",
    (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        commandBar.toggle();
      }
    },
    { passive: true }
  );

  const homeItems = [
    {
      label: "View Home",
      icon: HomeIcon,
      onSelect: () => router.push("/"),
    },
  ];

  const feedbackItems = [
    {
      label: "View feedback",
      icon: MessageCircleIcon,
      onSelect: () => router.push("/feedback"),
    },
    {
      label: "Create new feedback...",
      icon: PlusIcon,
      onSelect: feedbackForm.show,
    },
  ];

  const initiativeItems = [
    {
      label: "View initiatives",
      icon: CompassIcon,
      onSelect: () => router.push("/initiatives"),
    },
    {
      label: "Create new initiative...",
      icon: PlusIcon,
      onSelect: () => initiativeForm.show(),
    },
  ];

  const featuresItems = [
    {
      label: "View features",
      icon: GridIcon,
      onSelect: () => router.push("/features"),
    },
    {
      label: "Create new feature...",
      icon: PlusIcon,
      onSelect: featureForm.show,
    },
    {
      label: "Create new product...",
      icon: PlusIcon,
      onSelect: productForm.show,
    },
  ];

  if (hasProducts) {
    featuresItems.push({
      label: "Create new group...",
      icon: PlusIcon,
      onSelect: groupForm.show,
    });
  }

  const changelogItems = [
    {
      label: "View changelog",
      icon: ClockIcon,
      onSelect: () => router.push("/changelog"),
    },
    {
      label: "Create new changelog...",
      icon: PlusIcon,
      onSelect: changelogForm.show,
    },
  ];

  const pageItems = [
    {
      label: "View Welcome",
      icon: StarIcon,
      onSelect: () => router.push("/welcome"),
    },
    {
      label: "View Eve",
      icon: BotMessageSquareIcon,
      onSelect: () => router.push("/eve"),
    },
    {
      label: "View Roadmap",
      icon: ClockIcon,
      onSelect: () => router.push("/roadmap"),
    },
    {
      label: "View Settings",
      icon: CogIcon,
      onSelect: () => router.push("/settings"),
    },
    {
      label: "View API",
      icon: CodeIcon,
      onSelect: () => router.push("/api"),
    },
    {
      label: "View Feature Statuses",
      icon: ArrowUpCircleIcon,
      onSelect: () => router.push("/settings/statuses"),
    },
    {
      label: "View Integrations",
      icon: LinkIcon,
      onSelect: () => router.push("/settings/integrations"),
    },
    {
      label: "Import from another tool",
      icon: ImportIcon,
      onSelect: () => router.push("/settings/import"),
    },
  ];

  const other = [
    {
      label: "Toggle sidebar",
      icon: ClockIcon,
      onSelect: () => sidebar.setOpen(!sidebar.open),
    },
  ];

  return (
    <CommandDialog
      modal={false}
      onOpenChange={() => commandBar.toggle()}
      open={commandBar.isOpen}
    >
      <Command
        className={cn(
          "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
          "[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2",
          "[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5",
          "[&_[cmdk-input]]:h-12",
          "[&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3",
          // '[&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5',
          "dark:[&_[cmdk-group-heading]]:text-muted-foreground",
          "bg-transparent dark:bg-transparent"
        )}
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Home">
            {homeItems.map((item) => (
              <CommandBarItem {...item} key={item.label} />
            ))}
          </CommandGroup>
          <CommandGroup heading="Feedback">
            {feedbackItems.map((item) => (
              <CommandBarItem {...item} key={item.label} />
            ))}
          </CommandGroup>
          <CommandGroup heading="Initiatives">
            {initiativeItems.map((item) => (
              <CommandBarItem {...item} key={item.label} />
            ))}
          </CommandGroup>
          <CommandGroup heading="Features">
            {featuresItems.map((item) => (
              <CommandBarItem {...item} key={item.label} />
            ))}
          </CommandGroup>
          <CommandGroup heading="Changelog">
            {changelogItems.map((item) => (
              <CommandBarItem {...item} key={item.label} />
            ))}
          </CommandGroup>
          <CommandGroup heading="Pages">
            {pageItems.map((item) => (
              <CommandBarItem {...item} key={item.label} />
            ))}
          </CommandGroup>
          <CommandGroup heading="Other">
            {other.map((item) => (
              <CommandBarItem {...item} key={item.label} />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
