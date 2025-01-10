import { currentUser } from '@repo/backend/auth/utils';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ModeToggle } from './components/mode-toggle';
import { ProfileForm } from './components/profile-form';
import { ProfilePhoto } from './components/profile-photo';

export const metadata: Metadata = createMetadata({
  title: 'Profile',
  description: 'Manage your account info.',
});

const Profile = async () => {
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  return (
    <div className="p-16">
      <div className="mx-auto grid w-full max-w-xl divide-y rounded-lg border bg-background shadow-sm">
        <div className="grid grid-cols-3 gap-8 p-8">
          <div>
            <div className="relative aspect-square overflow-hidden overflow-hidden rounded-xl">
              <ProfilePhoto userId={user.id} />
              {user.user_metadata.image_url && (
                <Image
                  src={user.user_metadata.image_url}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
            {user.user_metadata.image_url && (
              <p className="mt-1 text-center text-muted-foreground text-xs">
                Click or drag-and-drop to change
              </p>
            )}
          </div>
          <div className="col-span-2">
            <ProfileForm
              defaultFirstName={user.user_metadata.first_name}
              defaultLastName={user.user_metadata.last_name}
              defaultEmail={user.email ?? ''}
            />
          </div>
        </div>
        <div className="p-8">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

export default Profile;
