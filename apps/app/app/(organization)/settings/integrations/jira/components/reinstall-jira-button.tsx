'use client';

import { Link } from '@repo/design-system/components/link';
import { Button } from '@repo/design-system/components/ui/button';

export const ReinstallJiraButton = () => {
  return (
    <Button type="submit" variant="outline" asChild>
      <Link href="/api/integrations/jira/start" className="no-underline">
        Reinstall Jira Integration
      </Link>
    </Button>
  );
};
