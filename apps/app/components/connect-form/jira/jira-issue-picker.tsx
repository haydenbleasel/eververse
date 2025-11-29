import { useDebouncedEffect } from "@react-hookz/web";
import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/design-system/components/ui/command";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { handleError } from "@repo/design-system/lib/handle-error";
import { cn } from "@repo/design-system/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { useConnectForm } from "../use-connect-form";
import { connectToJira } from "./connect-to-jira";
import type { SearchJiraIssuesResponse } from "./search-jira-issues";
import { searchJiraIssues } from "./search-jira-issues";

export const JiraIssuePicker = () => {
  const { featureId, hide } = useConnectForm();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchJiraIssuesResponse["issues"]>([]);
  const [value, setValue] = useState<string | undefined>();
  const id = useId();
  const selectedIssue = data.find((issue) => issue.id === value);
  const disabled = !featureId || loading || !value || !selectedIssue;

  const handleConnectJira = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await connectToJira({
        featureId,
        externalId: value,
        href: selectedIssue.url,
      });

      if (error) {
        throw new Error(error);
      }

      hide();

      window.open(selectedIssue.url, "_blank");
      window.location.reload();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useDebouncedEffect(
    () => {
      setLoading(true);

      if (!query) {
        setData([]);
        setLoading(false);
        return;
      }

      searchJiraIssues(query)
        .then((response) => {
          if ("error" in response) {
            throw new Error(response.error);
          }

          return response.issues;
        })
        .then(setData)
        .catch(handleError)
        .finally(() => setLoading(false));
    },
    [query],
    200
  );

  return (
    <div className="flex items-end gap-4">
      <div className="flex w-full flex-col gap-2">
        <Label htmlFor={id}>Select an existing issue</Label>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              className="w-full justify-between"
              variant="outline"
            >
              {selectedIssue ? (
                <div className="flex items-center gap-2">
                  <Image
                    alt=""
                    className="h-4 w-4 shrink-0 object-fit"
                    height={16}
                    src={selectedIssue.image}
                    unoptimized
                    width={16}
                  />
                  <span className="shrink-0">{selectedIssue.key}</span>
                  <span className="truncate text-muted-foreground">
                    {selectedIssue.title}
                  </span>
                </div>
              ) : (
                "Select issue..."
              )}
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[264px] p-0">
            <Command shouldFilter={false}>
              <div className="relative">
                <CommandInput
                  className="h-9"
                  onValueChange={setQuery}
                  placeholder="Search issues..."
                  value={query}
                />
                {loading ? (
                  <div className="absolute top-3 right-3">
                    <LoadingCircle />
                  </div>
                ) : null}
              </div>
              <CommandList>
                <CommandEmpty>No issue found.</CommandEmpty>
                <CommandGroup>
                  {data.map((issue) => (
                    <CommandItem
                      className="flex items-center gap-2"
                      key={issue.id}
                      onSelect={(currentValue) => {
                        setValue(currentValue);
                        setOpen(false);
                      }}
                      value={issue.id}
                    >
                      <Image
                        alt=""
                        className="h-4 w-4 shrink-0 object-fit"
                        height={16}
                        src={issue.image}
                        unoptimized
                        width={16}
                      />
                      <span className="shrink-0">{issue.key}</span>
                      <span className="truncate text-muted-foreground">
                        {issue.title}
                      </span>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === issue.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button
        className="shrink-0"
        disabled={disabled}
        onClick={handleConnectJira}
        type="submit"
      >
        Sync feature
      </Button>
    </div>
  );
};
