import { FeedbackItem } from '@/app/(organization)/feedback/components/feedback-item';
import { database } from '@/lib/database';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { Separator } from '@repo/design-system/components/ui/separator';
import { contentToText } from '@repo/editor/lib/tiptap';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

type FeedbackCompanyPageProperties = {
  readonly params: Promise<{
    company: string;
  }>;
};

export const generateMetadata = async (
  props: FeedbackCompanyPageProperties
): Promise<Metadata> => {
  const params = await props.params;
  const company = await database.feedbackOrganization.findUnique({
    where: { id: params.company },
    select: { name: true, domain: true },
  });

  if (!company) {
    return {};
  }

  return createMetadata({
    title: company.name,
    description: company.domain ?? '',
  });
};

const FeedbackCompanyPage = async (props: FeedbackCompanyPageProperties) => {
  const params = await props.params;
  const [company, feedback] = await Promise.all([
    database.feedbackOrganization.findUnique({
      where: { id: params.company },
      select: {
        name: true,
        domain: true,
      },
    }),
    database.feedback.findMany({
      where: {
        feedbackUser: {
          feedbackOrganizationId: params.company,
        },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        feedbackUser: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        aiSentiment: true,
      },
    }),
  ]);

  if (!company) {
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
      <div className="mx-auto grid w-full max-w-prose gap-6">
        {company.domain ? (
          <Image
            src={`https://logo.clearbit.com/${company.domain}`}
            alt={company.name}
            width={96}
            height={96}
            className="m-0 rounded-full"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-card" />
        )}

        <div className="grid gap-2">
          <h2 className="resize-none border-none bg-transparent p-0 font-semibold text-4xl text-foreground tracking-tight shadow-none outline-none">
            {company.name}
          </h2>
          <p className="text-muted-foreground">{company.domain}</p>
        </div>

        <Separator />

        <div className="grid gap-2">
          <h2 className="font-semibold text-lg">Feedback</h2>
          <div className="grid gap-1">
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
      </div>
    </div>
  );
};

export default FeedbackCompanyPage;
