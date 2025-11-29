import type {
  Feature,
  FeatureStatus,
  Group,
  Product,
} from "@repo/backend/prisma/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/design-system/components/ui/command";
import { Label } from "@repo/design-system/components/ui/label";
import { createFuse } from "@repo/lib/fuse";
import { useState } from "react";

type TriageFeatureSelectorProperties = {
  readonly features: (Pick<Feature, "id" | "title"> & {
    readonly status: Pick<FeatureStatus, "color">;
    readonly product: Pick<Product, "name"> | null;
    readonly group: Pick<Group, "name"> | null;
  })[];
  readonly onSelect: (id: string) => void;
};

export const TriageFeatureSelector = ({
  features,
  onSelect,
}: TriageFeatureSelectorProperties) => {
  const [query, setQuery] = useState<string>("");
  const fuse = createFuse(features, ["title"]);
  const results = query
    ? fuse.search(query).map((result) => result.item)
    : features;

  return (
    <div className="space-y-1.5 p-3">
      <Label htmlFor="triage-menu">Connect a feature</Label>
      <Command
        className="w-[350px] bg-transparent dark:bg-transparent"
        shouldFilter={false}
      >
        <div className="w-full overflow-hidden rounded-md border [&>div]:border-none">
          <CommandInput
            className="bg-transparent"
            id="triage-menu"
            onValueChange={setQuery}
            placeholder="Connect a feature..."
            value={query}
          />
        </div>
        <CommandList className="mt-1">
          <CommandEmpty>No features found.</CommandEmpty>
          <CommandGroup className="p-0">
            {results.slice(0, 6).map((feature) => (
              <CommandItem
                className="flex cursor-pointer items-center gap-2 rounded-md"
                key={feature.id}
                onSelect={() => onSelect(feature.id)}
                value={feature.title}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: feature.status.color }}
                />
                <span className="flex-1 truncate">{feature.title}</span>
                <span className="text-muted-foreground text-xs">
                  {[feature.product?.name, feature.group?.name]
                    .filter(Boolean)
                    .join(" / ")}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};
