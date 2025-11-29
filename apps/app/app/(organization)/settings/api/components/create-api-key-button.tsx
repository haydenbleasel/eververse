"use client";

import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { createAPIKey } from "@/actions/api-key/create";

export const CreateAPIKeyButton = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string>("");
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
        throw new Error("Key not found");
      }

      setNewKey(key);
      toast.success("API key created");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      cta="Create Key"
      description="API keys are used to authenticate your requests to the Eververse API."
      disabled={disabled}
      onClick={handleCreateKey}
      onOpenChange={setOpen}
      open={open}
      title="Create API Key"
      trigger={
        <div className="-m-2">
          <Tooltip content="Create API Key">
            <Button size="icon" variant="ghost">
              <PlusIcon className="text-muted-foreground" size={16} />
            </Button>
          </Tooltip>
        </div>
      }
    >
      <Input
        autoComplete="off"
        className="col-span-3"
        label="Name"
        maxLength={191}
        onChangeText={setName}
        placeholder="My Application"
        value={name}
      />
      {newKey ? (
        <div className="space-y-2">
          <hr className="my-4" />
          <p className="text-muted-foreground text-sm">Your new API key is:</p>
          <Input readOnly value={newKey} />
          <p className="text-muted-foreground text-sm">
            This will be the only time you can see this key.
          </p>
        </div>
      ) : null}
    </Dialog>
  );
};
