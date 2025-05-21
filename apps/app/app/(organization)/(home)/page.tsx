import { currentUser } from '@repo/backend/auth/utils';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Digest } from './components/digest';

const Greeting = dynamic(
  () => import('./components/greeting').then((mod) => mod.Greeting),
  {
    loading: () => <Skeleton className="h-10 w-full max-w-sm" />,
  }
);

export const metadata: Metadata = {
  title: 'Home',
  description: 'The homepage for your organization.',
};

const Home = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 p-6 py-16">
      <div className="grid gap-2">
        <Greeting firstName={user.user_metadata.first_name} />
        <p className="text-muted-foreground">Here's your daily digest.</p>
      </div>
      <div>
        <Suspense fallback={<Skeleton className="h-20 w-full max-w-2xl" />}>
          <Digest />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
