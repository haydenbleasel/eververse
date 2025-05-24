import { currentUser } from '@repo/backend/auth/utils';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
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
      <div className="mx-auto grid w-full max-w-2xl divide-y rounded-lg border bg-background shadow-sm">
        <div className="grid grid-cols-3 gap-8 p-8">
          <div>
            <ProfilePhoto
              userId={user.id}
              avatarUrl={user.user_metadata.image_url}
            />
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
