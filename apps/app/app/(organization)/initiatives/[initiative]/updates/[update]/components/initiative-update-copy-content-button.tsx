'use client';

import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/lib/toast';
import { CopyIcon } from 'lucide-react';

type InitiativeUpdateCopyContentButtonProps = {
  html: string;
  text: string;
};

export const InitiativeUpdateCopyContentButton = ({
  html,
  text,
}: InitiativeUpdateCopyContentButtonProps) => {
  const handleCopy = async () => {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      toast.success('Content copied to clipboard');
    } catch (_error) {
      toast.error('Failed to copy content');
    }
  };

  return (
    <Tooltip content="Copy content">
      <Button size="icon" variant="outline" onClick={handleCopy}>
        <CopyIcon size={16} className="text-muted-foreground" />
      </Button>
    </Tooltip>
  );
};
