import { AvatarTooltip } from '@/components/avatar-tooltip';
import { env } from '@/env';
import { handleAuthedState } from '@/lib/auth';
import { getUserName } from '@repo/backend/auth/format';
import { createClient } from '@repo/backend/auth/server';
import { database } from '@repo/backend/database';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { Link } from '@repo/design-system/components/link';
import { Logo } from '@repo/design-system/components/logo';
import { Prose } from '@repo/design-system/components/prose';
import { Badge } from '@repo/design-system/components/ui/badge';
import { contentToHtml } from '@repo/editor/lib/tiptap';
import { formatDate } from '@repo/lib/format';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Balancer from 'react-wrap-balancer';
import { LoginForm } from './components/form';

const title = 'Sign in';
const description = 'Sign in to your account.';

export const metadata: Metadata = createMetadata({ title, description });

const ContributorAvatar = async ({
  userId,
}: {
  readonly userId: string;
}) => {
  const supabase = await createClient();
  const response = await supabase.auth.admin.getUserById(userId);

  if (response.error) {
    return <div />;
  }

  return (
    <AvatarTooltip
      title={getUserName(response.data.user)}
      subtitle="Eververse team"
      src={response.data.user.user_metadata.image_url}
      fallback="E"
    />
  );
};

const SignInPage = async () => {
  const changelog = await database.changelog.findMany({
    where: {
      organizationId: env.EVERVERSE_ADMIN_ORGANIZATION_ID,
      status: 'PUBLISHED',
    },
    orderBy: { publishAt: 'desc' },
    take: 1,
    select: {
      id: true,
      title: true,
      publishAt: true,
      contributors: {
        select: { userId: true },
      },
      tags: {
        select: { id: true, name: true },
      },
    },
  });

  const latestUpdate = changelog.at(0);
  const content = latestUpdate
    ? await getJsonColumnFromTable('changelog', 'content', latestUpdate.id)
    : null;
  const html = content ? contentToHtml(content) : 'No content.';

  await handleAuthedState();

  return (
    <div className="grid h-screen w-screen divide-x lg:grid-cols-2">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[400px] space-y-8">
          <Logo className="mx-auto h-12 w-12" />
          <LoginForm />
          <Prose>
            <p className="text-center text-muted-foreground text-sm">
              <Balancer>
                By signing in, you agree to our{' '}
                <Link href="https://www.eververse.ai/legal/terms">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="https://www.eververse.ai/legal/privacy">
                  Privacy Policy
                </Link>
                .
              </Balancer>
            </p>
          </Prose>
        </div>
      </div>
      <div className="hidden h-full w-full items-start justify-center overflow-y-auto bg-background px-24 py-24 lg:flex">
        <div className="flex w-full flex-col gap-8">
          <p className="font-medium text-muted-foreground text-sm">
            Latest update
          </p>
          {latestUpdate ? (
            <Prose key={latestUpdate.id} className="prose-img:rounded-lg">
              <h1 className="mt-0">{latestUpdate.title}</h1>

              <div className="mt-4 mb-12 flex items-center gap-2">
                <span className="text-sm">by</span>
                <div className="-space-x-1 not-prose flex items-center hover:space-x-1 [&>*]:transition-all">
                  {latestUpdate.contributors.map((contributor) => (
                    <div key={contributor.userId}>
                      <ContributorAvatar userId={contributor.userId} />
                    </div>
                  ))}{' '}
                </div>
                <span className="text-sm">
                  on {formatDate(latestUpdate.publishAt)}
                </span>
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: html,
                }}
              />

              <div className="my-8 flex flex-wrap items-center gap-1">
                {latestUpdate.tags.map((tag) => (
                  <Badge variant="secondary" key={tag.id}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Prose>
          ) : (
            <p className="text-muted-foreground text-sm">No updates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
