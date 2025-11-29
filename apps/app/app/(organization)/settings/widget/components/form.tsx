"use client";

import type { Widget, WidgetItem } from "@repo/backend/prisma/client";
import { Link } from "@repo/design-system/components/link";
import { Switch } from "@repo/design-system/components/precomposed/switch";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { StackCard } from "@repo/design-system/components/stack-card";
import { Button } from "@repo/design-system/components/ui/button";
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@repo/design-system/components/ui/kibo-ui/code-block";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { DynamicIcon } from "@repo/widget/components/dynamic-icon";
import { PenIcon, PlusIcon } from "lucide-react";
import type dynamicIconImports from "lucide-react/dynamicIconImports";
import { useState } from "react";
import { updateWidget } from "@/actions/widget/update";
import { CreateLinkModal } from "./create-link-modal";
import { DeleteWidgetItemButton } from "./delete-widget-item-button";

type WidgetFormProperties = {
  readonly widgetUrl: string;
  readonly isSubscribed: boolean;
  readonly data: Widget & {
    items: WidgetItem[];
  };
  readonly hasPortal: boolean;
  readonly slug: string;
};

export const WidgetForm = ({
  data,
  widgetUrl,
  isSubscribed,
  hasPortal,
  slug,
}: WidgetFormProperties) => {
  const [enablePortal, setEnablePortal] = useState(
    hasPortal ? data.enablePortal : false
  );
  const [enableFeedback, setEnableFeedback] = useState(data.enableFeedback);
  const [enableChangelog, setEnableChangelog] = useState(data.enableChangelog);
  const [darkMode, setDarkMode] = useState(false);

  const code = [
    {
      language: "javascript",
      filename: "widget.js",
      code: `<script>
  (function() {
    window.EververseWidgetId = '${data.id}';
    window.EververseWidgetDarkMode = ${darkMode ? "true" : "false"};
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '${new URL("/widget.js", widgetUrl).toString()}';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>`,
    },
  ];

  const handleUpdateWidget = async (properties: Partial<Widget>) => {
    try {
      const response = await updateWidget(data.id, properties);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Widget updated successfully");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl tracking-tight">Widget</h1>
        <p className="mb-0 text-muted-foreground">
          Create a widget for websites and apps.
        </p>
      </div>

      <StackCard className="p-4" title="Custom Links">
        {isSubscribed ? (
          <>
            {data.items.map((item) => (
              <div
                className="flex items-center justify-between gap-4"
                key={item.id}
              >
                <a
                  className="flex items-center gap-2 p-2"
                  href={item.link}
                  key={item.id}
                >
                  <DynamicIcon
                    className="shrink-0 text-muted-foreground"
                    name={item.icon as keyof typeof dynamicIconImports}
                    size={16}
                  />
                  <p className="flex-1 font-medium text-sm">{item.name}</p>
                </a>
                <div className="flex items-center gap-px">
                  <CreateLinkModal data={item} widgetId={data.id}>
                    <Tooltip content="Edit">
                      <Button size="icon" variant="ghost">
                        <PenIcon size={16} />
                      </Button>
                    </Tooltip>
                  </CreateLinkModal>
                  <DeleteWidgetItemButton data={item} />
                </div>
              </div>
            ))}

            <CreateLinkModal widgetId={data.id}>
              <Button
                className="flex items-center gap-2"
                size="sm"
                variant="link"
              >
                <PlusIcon size={16} />
                <span>Add a link</span>
              </Button>
            </CreateLinkModal>
          </>
        ) : (
          <Link
            className="font-medium text-foreground text-sm underline"
            href={`/${slug}/subscribe`}
          >
            Upgrade to a paid plan to add custom links!
          </Link>
        )}
      </StackCard>

      <StackCard className="space-y-2 p-4" title="Options">
        <Switch
          checked={enableChangelog}
          description="Enable Changelog"
          onCheckedChange={async (newValue) => {
            setEnableChangelog(newValue);
            return await handleUpdateWidget({ enableChangelog: newValue });
          }}
        />
        <Switch
          checked={enablePortal}
          description="Enable Portal"
          disabled={!hasPortal}
          onCheckedChange={async (newValue) => {
            setEnablePortal(newValue);
            return await handleUpdateWidget({ enablePortal: newValue });
          }}
        />
        <Switch
          checked={enableFeedback}
          description="Enable Feedback"
          onCheckedChange={async (newValue) => {
            setEnableFeedback(newValue);
            return await handleUpdateWidget({ enableFeedback: newValue });
          }}
        />
        <Switch
          checked={darkMode}
          description="Dark Mode"
          onCheckedChange={setDarkMode}
        />
      </StackCard>

      <StackCard className="p-0" title="Embed Code">
        <CodeBlock
          className="dark rounded-none border-none"
          data={code}
          defaultValue={code[0].language}
        >
          <CodeBlockBody>
            {(item) => (
              <CodeBlockItem
                className="[&_.shiki]:!bg-transparent dark:[&_.shiki]:!bg-transparent [&_.shiki_code]:!text-sm"
                key={item.language}
                value={item.language}
              >
                <CodeBlockContent
                  language={item.language as BundledLanguage}
                  themes={{
                    light: "nord",
                    dark: "nord",
                  }}
                >
                  {item.code}
                </CodeBlockContent>
              </CodeBlockItem>
            )}
          </CodeBlockBody>
        </CodeBlock>
      </StackCard>
    </div>
  );
};
