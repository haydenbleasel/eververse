import { FeedbackItem } from '@/app/(organization)/feedback/components/feedback-item';
import { database } from '@/lib/database';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { Prose } from '@repo/design-system/components/prose';
import { Separator } from '@repo/design-system/components/ui/separator';
import { cn } from '@repo/design-system/lib/utils';
import { contentToText } from '@repo/editor/lib/tiptap';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

type FeedbackUserPageProperties = {
  readonly params: Promise<{
    user: string;
  }>;
};

export const generateMetadata = async (
  props: FeedbackUserPageProperties
): Promise<Metadata> => {
  const params = await props.params;
  const user = await database.feedbackUser.findUnique({
    where: { id: params.user },
    select: { name: true, email: true },
  });

  if (!user) {
    return {};
  }

  return createMetadata({
    title: user.name,
    description: user.email,
  });
};

const FeedbackUserPage = async (props: FeedbackUserPageProperties) => {
  const params = await props.params;
  const [user, feedback] = await Promise.all([
    database.feedbackUser.findUnique({
      where: { id: params.user },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
    }),
    database.feedback.findMany({
      where: { feedbackUserId: params.user },
      select: {
        id: true,
        title: true,
        createdAt: true,
        aiSentiment: true,
        feedbackUser: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const promises = feedback.map(async (feedbackItem) => {
    const content = await getJsonColumnFromTable(
      'feedback',
      'content',
      feedbackItem.id
    );

    return {
      ...feedbackItem,
      text: content ? contentToText(content) : 'No description provided.',
    };
  });

  const modifiedFeedback = await Promise.all(promises);

  return (
    <div className="w-full px-6 py-16">
      <Prose className="mx-auto grid w-full gap-6">
        <Image
          src={user.imageUrl}
          alt={user.name}
          width={96}
          height={96}
          className="m-0 h-24 w-24 rounded-full object-fill"
        />

        <div>
          <h2
            className={cn(
              'resize-none border-none bg-transparent p-0 font-semibold text-4xl tracking-tight shadow-none outline-none',
              'text-foreground'
            )}
          >
            {user.name}
          </h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <Separator />

        <div>
          <h2>Feedback</h2>
          <div className="not-prose space-y-1">
            {modifiedFeedback.map((feedbackItem) => (
              <div
                className="overflow-hidden rounded-md border bg-background"
                key={feedbackItem.id}
              >
                <FeedbackItem feedback={feedbackItem} />
              </div>
            ))}
          </div>
        </div>
      </Prose>
    </div>
  );
};

export default FeedbackUserPage;
