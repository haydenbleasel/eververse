import { getJsonColumnFromTable } from "@repo/backend/database";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import { contentToText } from "@repo/editor/lib/tiptap";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FeedbackItem } from "@/app/(organization)/feedback/components/feedback-item";
import { database } from "@/lib/database";

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
      "feedback",
      "content",
      feedbackItem.id
    );

    return {
      ...feedbackItem,
      text: content ? contentToText(content) : "No description provided.",
    };
  });

  const modifiedFeedback = await Promise.all(promises);

  return (
    <div className="w-full px-6 py-16">
      <div className="mx-auto grid w-full max-w-prose gap-6">
        <Image
          alt={user.name}
          className="m-0 h-24 w-24 rounded-full object-fill"
          height={96}
          src={user.imageUrl}
          width={96}
        />

        <div className="grid gap-2">
          <h2
            className={cn(
              "resize-none border-none bg-transparent p-0 font-semibold text-4xl tracking-tight shadow-none outline-none",
              "text-foreground"
            )}
          >
            {user.name}
          </h2>
          <p className="text-muted-foreground">{user.email}</p>
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

export default FeedbackUserPage;
