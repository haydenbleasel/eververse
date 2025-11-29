import { Link } from "@repo/design-system/components/link";
import { StackCard } from "@repo/design-system/components/stack-card";
import { GlobeIcon } from "lucide-react";
import { getPortalUrl } from "@/lib/portal";

export const PortalUrlCard = async () => {
  const portalUrl = await getPortalUrl();

  return (
    <StackCard icon={GlobeIcon} title="Portal URL">
      <div className="flex items-center gap-3 px-1">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <p className="m-0">
          Your portal is live at{" "}
          <Link className="underline" href={portalUrl}>
            {portalUrl}
          </Link>
        </p>
      </div>
    </StackCard>
  );
};
