import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Feedback } from "@repo/backend/prisma/client";
import { Link } from "@repo/design-system/components/link";
import { Avatar } from "@repo/design-system/components/precomposed/avatar";
import { Prose } from "@repo/design-system/components/prose";
import { SentimentEmoji } from "@repo/design-system/components/sentiment-emoji";
import { StackCard } from "@repo/design-system/components/stack-card";
import * as Accordion from "@repo/design-system/components/ui/accordion";
import { formatDate } from "@repo/lib/format";
import { SparklesIcon } from "lucide-react";
import Markdown from "react-markdown";
import { CompanyLogo } from "@/app/(organization)/components/company-logo";
import { database } from "@/lib/database";
import { FeedbackSettingsDropdown } from "./feedback-settings-dropdown";
import { ProcessFeedbackButton } from "./process-feedback-button";

type FeedbackPanelProps = {
  feedbackId: Feedback["id"];
};

export const FeedbackPanel = async ({ feedbackId }: FeedbackPanelProps) => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    return null;
  }

  const [feedback, feedbackUsers, feedbackOrganizations, organization] =
    await Promise.all([
      database.feedback.findUnique({
        where: { id: feedbackId },
        select: {
          id: true,
          createdAt: true,
          processed: true,
          feedbackUser: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              feedbackOrganization: {
                select: {
                  id: true,
                  name: true,
                  domain: true,
                },
              },
            },
          },
          aiSentiment: true,
          aiSentimentReason: true,
          analysis: true,
        },
      }),
      database.feedbackUser.findMany(),
      database.feedbackOrganization.findMany(),
      database.organization.findUnique({
        where: { id: organizationId },
        select: { stripeSubscriptionId: true },
      }),
    ]);

  if (!(feedback && organization)) {
    return null;
  }

  const tabs = [
    {
      label: "Summary",
      value: feedback.analysis?.summary,
    },
    {
      label: "Pain Points",
      value: feedback.analysis?.painPoints,
    },
    {
      label: "Recommendations",
      value: feedback.analysis?.recommendations,
    },
    {
      label: "Outcomes",
      value: feedback.analysis?.outcomes,
    },
  ];

  return (
    <StackCard className="p-0 text-sm">
      <div className="grid gap-2 p-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">Created</p>
          <p>{formatDate(feedback.createdAt)}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">Processed</p>
          <p>{feedback.processed ? "Yes" : "No"}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">Feedback User</p>
          {feedback.feedbackUser ? (
            <Link
              className="flex items-center gap-2"
              href={`/data/users/${feedback.feedbackUser.id}`}
            >
              <Avatar
                fallback={feedback.feedbackUser.name.slice(0, 2)}
                size={20}
                src={feedback.feedbackUser.imageUrl}
              />
              <p>{feedback.feedbackUser.name}</p>
            </Link>
          ) : (
            <p className="text-muted-foreground">None</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">Feedback Organization</p>
          {feedback.feedbackUser?.feedbackOrganization ? (
            <Link
              className="flex items-center gap-2"
              href={`/data/companies/${feedback.feedbackUser.feedbackOrganization.id}`}
            >
              <CompanyLogo
                fallback={feedback.feedbackUser.feedbackOrganization.name.slice(
                  0,
                  2
                )}
                size={20}
                src={feedback.feedbackUser.feedbackOrganization.domain}
              />
              <p>{feedback.feedbackUser.feedbackOrganization.name}</p>
            </Link>
          ) : (
            <p className="text-muted-foreground">None</p>
          )}
        </div>
        {feedback.aiSentiment && organization.stripeSubscriptionId ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-primary">
              <SparklesIcon size={16} />
              <p className="m-0">Sentiment</p>
            </div>
            <div className="flex items-center gap-2">
              <SentimentEmoji
                description={feedback.aiSentimentReason}
                value={feedback.aiSentiment}
              />
              <p>
                {feedback.aiSentiment
                  .toLowerCase()
                  .replace(/^\w/u, (char) => char.toUpperCase())}
              </p>
            </div>
          </div>
        ) : null}

        {feedback.analysis && organization.stripeSubscriptionId ? (
          <Accordion.Accordion className="grid gap-2" type="multiple">
            {tabs.map((tab) => (
              <Accordion.AccordionItem
                className="border-none"
                key={tab.label}
                value={tab.label}
              >
                <Accordion.AccordionTrigger className="p-0 font-normal no-underline">
                  <div className="flex items-center gap-2 text-primary">
                    <SparklesIcon size={16} />
                    <p className="m-0">{tab.label}</p>
                  </div>
                </Accordion.AccordionTrigger>
                <Accordion.AccordionContent className="mt-2 p-0">
                  {tab.value ? (
                    <Prose className="!max-w-none !text-sm">
                      <Markdown>{tab.value}</Markdown>
                    </Prose>
                  ) : (
                    <p className="text-muted-foreground">None.</p>
                  )}
                </Accordion.AccordionContent>
              </Accordion.AccordionItem>
            ))}
          </Accordion.Accordion>
        ) : null}
      </div>
      {user.user_metadata.organization_role === EververseRole.Member ? null : (
        <div className="flex items-center justify-between border-t p-1">
          <ProcessFeedbackButton
            defaultValue={feedback.processed}
            feedbackId={feedbackId}
          />
          <FeedbackSettingsDropdown
            defaultFeedbackOrganizationId={
              feedback.feedbackUser?.feedbackOrganization?.id
            }
            defaultFeedbackUserId={feedback.feedbackUser?.id}
            feedbackId={feedbackId}
            organizations={feedbackOrganizations}
            users={feedbackUsers}
          />
        </div>
      )}
    </StackCard>
  );
};
