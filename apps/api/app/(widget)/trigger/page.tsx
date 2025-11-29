import { Logomark } from "@repo/design-system/components/logo";
import { cn } from "@repo/design-system/lib/utils";

type WidgetTriggerProperties = {
  readonly searchParams?: Promise<
    Record<string, string[] | string | undefined>
  >;
};

const WidgetTrigger = async (props: WidgetTriggerProperties) => {
  const searchParams = await props.searchParams;
  const darkMode = searchParams?.darkMode === "true";

  return (
    <div className={cn("h-full w-full", darkMode ? "dark" : "")}>
      <div className="flex h-full w-full items-center justify-center rounded-full border border-black/10 bg-primary">
        <Logomark className="h-[60%] w-[60%] text-white" />
      </div>
    </div>
  );
};

export default WidgetTrigger;
