'use client';

import { createAPIKey } from '@/actions/api-key/create';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

export const CreateAPIKeyButton = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string>('');
  const disabled = !name.trim() || loading || Boolean(newKey);

  const handleCreateKey = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const { key, error } = await createAPIKey(name);

      if (error) {
        throw new Error(error);
      }

      if (!key) {
        throw new Error('Key not found');
      }

      setNewKey(key);
      toast.success('API key created');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Create API Key"
      description="API keys are used to authenticate your requests to the Eververse API."
      trigger={
        <div className="-m-2">
          <Tooltip content="Create API Key">
            <Button size="icon" variant="ghost">
              <PlusIcon size={16} className="text-muted-foreground" />
            </Button>
          </Tooltip>
        </div>
      }
      onClick={handleCreateKey}
      disabled={disabled}
      cta="Create Key"
    >
      <Input
        label="Name"
        placeholder="My Application"
        className="col-span-3"
        value={name}
        onChangeText={setName}
        maxLength={191}
        autoComplete="off"
      />
      {newKey ? (
        <div className="space-y-2">
          <hr className="my-4" />
          <p className="text-muted-foreground text-sm">Your new API key is:</p>
          <Input value={newKey} readOnly />
          <p className="text-muted-foreground text-sm">
            This will be the only time you can see this key.
          </p>
        </div>
      ) : null}
    </Dialog>
  );
};
