'use client';

import { updateOrganization } from '@/actions/organization/update';
import { createClient } from '@repo/backend/auth/client';
import type { Organization } from '@repo/backend/prisma/client';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@repo/design-system/components/ui/kibo-ui/dropzone';
import { handleError } from '@repo/design-system/lib/handle-error';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

type OrganizationLogoFormProperties = {
  readonly organizationId: Organization['id'];
  readonly logoUrl: string | null;
};

export const OrganizationLogoForm = ({
  organizationId,
  logoUrl,
}: OrganizationLogoFormProperties) => {
  const [tempFile, setTempFile] = useState<File | null>(null);

  const handleDrop = async (files: File[]) => {
    const [file] = files;

    setTempFile(file);

    try {
      const supabase = createClient();

      const response = await supabase.storage
        .from('organizations')
        .upload(organizationId, file, {
          upsert: true,
        });

      if (response.error) {
        throw response.error;
      }

      const { data: publicUrl } = supabase.storage
        .from('organizations')
        .getPublicUrl(organizationId);

      const { error } = await updateOrganization({
        logoUrl: publicUrl.publicUrl,
      });

      if (error) {
        throw error;
      }

      toast.success('Logo updated');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dropzone
      maxFiles={1}
      accept={{ 'image/*': [] }}
      onDrop={handleDrop}
      onError={console.error}
      className="aspect-square"
    >
      <DropzoneEmptyState>
        {logoUrl ? (
          <div className="relative size-full">
            <Image
              src={logoUrl}
              alt="Preview"
              className="absolute top-0 left-0 h-full w-full object-cover"
              unoptimized
              width={102}
              height={102}
            />
          </div>
        ) : undefined}
      </DropzoneEmptyState>
      <DropzoneContent>
        {tempFile && (
          <div className="relative size-full">
            <Image
              src={URL.createObjectURL(tempFile)}
              alt="Preview"
              className="absolute top-0 left-0 h-full w-full object-cover"
              unoptimized
              width={102}
              height={102}
            />
          </div>
        )}
      </DropzoneContent>
    </Dropzone>
  );
};
