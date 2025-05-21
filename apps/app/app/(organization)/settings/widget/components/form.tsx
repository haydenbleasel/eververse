'use client';

import { updateWidget } from '@/actions/widget/update';
import type { Widget, WidgetItem } from '@repo/backend/prisma/client';
import { CodeBlock } from '@repo/design-system/components/code-block';
import { Link } from '@repo/design-system/components/link';
import { Switch } from '@repo/design-system/components/precomposed/switch';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { DynamicIcon } from '@repo/widget/components/dynamic-icon';
import { PenIcon, PlusIcon } from 'lucide-react';
import type dynamicIconImports from 'lucide-react/dynamicIconImports';
import { useState } from 'react';
import { CreateLinkModal } from './create-link-modal';
import { DeleteWidgetItemButton } from './delete-widget-item-button';

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

  const embedCode = `<script>
  (function() {
    window.EververseWidgetId = '${data.id}';
    window.EververseWidgetDarkMode = ${darkMode ? 'true' : 'false'};
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '${new URL('/widget.js', widgetUrl).toString()}';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>`;

  const handleUpdateWidget = async (properties: Partial<Widget>) => {
    try {
      const response = await updateWidget(data.id, properties);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Widget updated successfully');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl">Widget</h1>
        <p className="mb-0 text-muted-foreground">
          Create a widget for websites and apps.
        </p>
      </div>

      <StackCard title="Custom Links" className="p-4">
        {isSubscribed ? (
          <>
            {data.items.map((item) => (
              <div
                className="flex items-center justify-between gap-4"
                key={item.id}
              >
                <a
                  key={item.id}
                  className="flex items-center gap-2 p-2"
                  href={item.link}
                >
                  <DynamicIcon
                    name={item.icon as keyof typeof dynamicIconImports}
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                  <p className="flex-1 font-medium text-sm">{item.name}</p>
                </a>
                <div className="flex items-center gap-px">
                  <CreateLinkModal widgetId={data.id} data={item}>
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
            href={`/${slug}/subscribe`}
            className="font-medium text-foreground text-sm underline"
          >
            Upgrade to a paid plan to add custom links!
          </Link>
        )}
      </StackCard>

      <StackCard title="Options" className="space-y-2 p-4">
        <Switch
          checked={enableChangelog}
          onCheckedChange={async (newValue) => {
            setEnableChangelog(newValue);
            return handleUpdateWidget({ enableChangelog: newValue });
          }}
          description="Enable Changelog"
        />
        <Switch
          disabled={!hasPortal}
          checked={enablePortal}
          onCheckedChange={async (newValue) => {
            setEnablePortal(newValue);
            return handleUpdateWidget({ enablePortal: newValue });
          }}
          description="Enable Portal"
        />
        <Switch
          checked={enableFeedback}
          onCheckedChange={async (newValue) => {
            setEnableFeedback(newValue);
            return handleUpdateWidget({ enableFeedback: newValue });
          }}
          description="Enable Feedback"
        />
        <Switch
          checked={darkMode}
          onCheckedChange={setDarkMode}
          description="Dark Mode"
        />
      </StackCard>

      <StackCard title="Embed Code" className="p-0">
        <CodeBlock language="html" code={embedCode} />
      </StackCard>
    </div>
  );
};
