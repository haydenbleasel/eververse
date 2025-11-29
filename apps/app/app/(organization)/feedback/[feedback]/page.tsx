import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { getJsonColumnFromTable } from "@repo/backend/database";
import { Skeleton } from "@repo/design-system/components/precomposed/skeleton";
import { StackCard } from "@repo/design-system/components/stack-card";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "@repo/design-system/components/kibo-ui/video-player";
import { cn } from "@repo/design-system/lib/utils";
import { contentToText } from "@repo/editor/lib/tiptap";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { database } from "@/lib/database";
import { FeedbackEditor } from "./components/feedback-editor";
import { FeedbackPanel } from "./components/feedback-panel";
import { FeedbackTitle } from "./components/feedback-title";
import { TriageMenu } from "./components/triage-menu";

type FeedbackPageProperties = {
  readonly params: Promise<{
    feedback: string;
  }>;
};

export const dynamic = "force-dynamic";

export const generateMetadata = async (
  props: FeedbackPageProperties
): Promise<Metadata> => {
  const params = await props.params;
  const feedback = await database.feedback.findUnique({
    where: { id: params.feedback },
    select: {
      title: true,
      id: true,
    },
  });

  if (!feedback) {
    return {};
  }

  const { title } = feedback;
  const content = await getJsonColumnFromTable(
    "feedback",
    "content",
    feedback.id
  );
  const text = content ? contentToText(content) : "";

  return createMetadata({
    title,
    description: text.slice(0, 150),
  });
};

const FeedbackPage = async (props: FeedbackPageProperties) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    notFound();
  }

  const [feedback, features, organization] = await Promise.all([
    database.feedback.findUnique({
      where: { id: params.feedback },
      select: {
        id: true,
        title: true,
        audioUrl: true,
        videoUrl: true,
        transcript: true,
      },
    }),
    database.feature.findMany({
      select: {
        id: true,
        title: true,
        product: {
          select: {
            name: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
        status: {
          select: {
            color: true,
          },
        },
      },
    }),
    database.organization.findUnique({
      where: { id: organizationId },
      select: { stripeSubscriptionId: true },
    }),
  ]);

  if (!(feedback && organization)) {
    notFound();
  }

  const processingMedia =
    organization.stripeSubscriptionId &&
    (feedback.audioUrl ?? feedback.videoUrl) &&
    !feedback.transcript;

  const content =
    (await getJsonColumnFromTable("feedback", "content", params.feedback)) ??
    undefined;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="mx-auto grid w-full max-w-prose gap-6 px-6 py-16">
        <FeedbackTitle
          defaultTitle={feedback.title}
          editable={
            user.user_metadata.organization_role !== EververseRole.Member
          }
          feedbackId={params.feedback}
        />
        <Suspense
          fallback={
            <Skeleton
              className={cn(
                "w-full",
                organization.stripeSubscriptionId ? "h-[315px]" : "h-[175px]"
              )}
            />
          }
        >
          <FeedbackPanel feedbackId={params.feedback} />
        </Suspense>
        {feedback.audioUrl ? (
          <StackCard title="Feedback Audio">
            <audio
              aria-label="Feedback audio"
              className="w-full"
              controls
              src={feedback.audioUrl}
            >
              <track kind="captions" label="English" src="" />
            </audio>
          </StackCard>
        ) : null}
        {feedback.videoUrl ? (
          <StackCard className="p-0" title="Feedback Video">
            <VideoPlayer className="flex flex-col">
              <VideoPlayerContent
                crossOrigin=""
                muted
                preload="auto"
                slot="media"
                src={feedback.videoUrl}
              />
              <VideoPlayerControlBar>
                <VideoPlayerPlayButton />
                <VideoPlayerSeekBackwardButton />
                <VideoPlayerSeekForwardButton />
                <VideoPlayerTimeRange />
                <VideoPlayerTimeDisplay showDuration />
                <VideoPlayerMuteButton />
                <VideoPlayerVolumeRange />
              </VideoPlayerControlBar>
            </VideoPlayer>
          </StackCard>
        ) : null}
        {processingMedia ? (
          <p className="text-muted-foreground text-sm">
            Processing transcript. Please check back later.
          </p>
        ) : (
          <FeedbackEditor
            defaultValue={content}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
            feedbackId={params.feedback}
            subscribed={Boolean(organization.stripeSubscriptionId)}
          >
            <TriageMenu
              aiEnabled={Boolean(organization.stripeSubscriptionId)}
              features={features}
              feedbackId={params.feedback}
            />
          </FeedbackEditor>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
