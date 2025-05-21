'use client';

import { updateOrganization } from '@/actions/organization/update';
import { createClient } from '@repo/backend/auth/client';
import type { Organization } from '@repo/backend/prisma/client';
import { Dropzone } from '@repo/design-system/components/dropzone';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from 'sonner';

type OrganizationLogoFormProperties = {
  readonly organizationId: Organization['id'];
};

export const OrganizationLogoForm = ({
  organizationId,
}: OrganizationLogoFormProperties) => {
  const handleUpload = async (file: File) => {
    try {
      const supabase = await createClient();

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
      accept="image/*"
      multiple={false}
      onChange={handleUpload}
      className="h-full w-full"
    />
  );
};
