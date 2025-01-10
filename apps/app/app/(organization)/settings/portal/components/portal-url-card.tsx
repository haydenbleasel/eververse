import { getPortalUrl } from '@/lib/portal';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';
import { GlobeIcon } from 'lucide-react';

export const PortalUrlCard = async () => {
  const portalUrl = await getPortalUrl();

  return (
    <StackCard title="Portal URL" icon={GlobeIcon}>
      <div className="flex items-center gap-3 px-1">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <p className="m-0">
          Your portal is live at{' '}
          <Link href={portalUrl} className="underline">
            {portalUrl}
          </Link>
        </p>
      </div>
    </StackCard>
  );
};
