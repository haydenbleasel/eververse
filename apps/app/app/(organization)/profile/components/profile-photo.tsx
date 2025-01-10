'use client';

import type { User } from '@repo/backend/auth';
import { createClient } from '@repo/backend/auth/client';
import { Dropzone } from '@repo/design-system/components/dropzone';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from 'sonner';

type ProfilePhotoProps = {
  userId: User['id'];
};

export const ProfilePhoto = ({ userId }: ProfilePhotoProps) => {
  const updateProfile = async (file: File) => {
    try {
      const supabase = await createClient();

      const response = await supabase.storage
        .from('users')
        .upload(userId, file, {
          upsert: true,
        });

      if (response.error) {
        throw response.error;
      }

      const { data: publicUrl } = supabase.storage
        .from('users')
        .getPublicUrl(userId);

      const { error } = await supabase.auth.updateUser({
        data: {
          image_url: publicUrl.publicUrl,
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Profile updated');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dropzone
      accept="image/*"
      multiple={false}
      onChange={updateProfile}
      className="h-full w-full"
    />
  );
};
