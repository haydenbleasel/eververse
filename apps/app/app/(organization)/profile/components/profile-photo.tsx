'use client';

import type { User } from '@repo/backend/auth';
import { createClient } from '@repo/backend/auth/client';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@repo/design-system/components/ui/kibo-ui/dropzone';
import { handleError } from '@repo/design-system/lib/handle-error';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

type ProfilePhotoProps = {
  userId: User['id'];
  avatarUrl: string | null;
};

export const ProfilePhoto = ({ userId, avatarUrl }: ProfilePhotoProps) => {
  const [tempFile, setTempFile] = useState<File | null>(null);

  const handleDrop = async (files: File[]) => {
    try {
      const supabase = await createClient();
      const [file] = files;

      setTempFile(file);

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
      maxFiles={1}
      accept={{ 'image/*': [] }}
      onDrop={handleDrop}
      onError={console.error}
      className="aspect-square"
    >
      <DropzoneEmptyState>
        {avatarUrl ? (
          <div className="relative size-full">
            <Image
              src={avatarUrl}
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
