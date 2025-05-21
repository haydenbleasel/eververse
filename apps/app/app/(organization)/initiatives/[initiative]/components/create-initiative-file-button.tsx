'use client';

import { createInitiativeFile } from '@/actions/initiative-file/create';
import { createClient } from '@repo/backend/auth/client';
import type { Initiative } from '@repo/backend/prisma/client';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

type CreateInitiativeFileButtonProperties = {
  readonly initiativeId: Initiative['id'];
};

export const CreateInitiativeFileButton = ({
  initiativeId,
}: CreateInitiativeFileButtonProperties) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || loading) {
      return;
    }

    const selectedFile = Array.from(event.target.files).at(0);

    if (!selectedFile) {
      return;
    }

    setLoading(true);

    const supabase = await createClient();

    const id = nanoid(36);
    const { data, error } = await supabase.storage
      .from('files')
      .upload(id, selectedFile);

    if (error) {
      throw new Error(error.message);
    }

    const {
      data: { publicUrl },
    } = await supabase.storage.from('files').getPublicUrl(data.path);

    await createInitiativeFile({
      initiativeId,
      data: {
        name: selectedFile.name,
        url: publicUrl,
      },
    });

    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <LoadingCircle dimensions="-m-1.5 h-4 w-4" />
      ) : (
        <Tooltip content="Upload a new file">
          <Button
            size="icon"
            variant="ghost"
            className="-m-1.5 h-6 w-6"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            <PlusIcon size={16} />
            <span className="sr-only">Upload file</span>
          </Button>
        </Tooltip>
      )}
      <input
        ref={inputRef}
        type="file"
        className="sr-only hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
    </>
  );
};
