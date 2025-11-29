import { EververseRole } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from "@repo/backend/auth/utils";
import { getJsonColumnFromTable } from "@repo/backend/database";
import type { Initiative, InitiativeUpdate } from "@repo/backend/prisma/client";
import { StackCard } from "@repo/design-system/components/stack-card";
import { Button } from "@repo/design-system/components/ui/button";
import { contentToHtml, contentToText } from "@repo/editor/lib/tiptap";
import { formatDate } from "@repo/lib/format";
import { createMetadata } from "@repo/seo/metadata";
import { SendIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { database } from "@/lib/database";
import { InitiativeUpdateCopyContentButton } from "./components/initiative-update-copy-content-button";
import { InitiativeUpdateEditor } from "./components/initiative-update-editor";
import { UpdateEmptyState } from "./components/initiative-update-empty-state";
import { InitiativeUpdateSendButton } from "./components/initiative-update-send-button";
import { InitiativeUpdateTitle } from "./components/initiative-update-title";

type InitiativeUpdatePageProperties = {
  readonly params: Promise<{
    readonly initiative: Initiative["id"];
    readonly update: InitiativeUpdate["id"];
  }>;
};

export const dynamic = "force-dynamic";

export const generateMetadata = async (
  props: InitiativeUpdatePageProperties
): Promise<Metadata> => {
  const params = await props.params;
  const update = await database.initiativeUpdate.findUnique({
    where: { id: params.update },
    select: {
      id: true,
      title: true,
    },
  });

  if (!update) {
    return {};
  }

  const content = await getJsonColumnFromTable(
    "initiative_update",
    "content",
    update.id
  );
  const text = content ? contentToText(content) : "No content yet.";

  return createMetadata({
    title: update.title,
    description: text.slice(0, 150),
  });
};

const InitiativeUpdatePage = async (props: InitiativeUpdatePageProperties) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    notFound();
  }

  const [update, members, organization] = await Promise.all([
    database.initiativeUpdate.findUnique({
      where: { id: params.update },
      select: {
        id: true,
        title: true,
        emailSentAt: true,
        slackSentAt: true,
        initiative: {
          select: {
            team: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    }),
    currentMembers(),
    database.organization.findUnique({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
      },
    }),
  ]);

  if (!(update && organization)) {
    notFound();
  }

  const content = await getJsonColumnFromTable(
    "initiative_update",
    "content",
    update.id
  );

  if (!(content && Object.keys(content).length)) {
    return (
      <div className="px-6 py-16">
        <div className="mx-auto grid max-w-prose gap-8">
          <InitiativeUpdateTitle
            defaultTitle={update.title}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
            initiativeUpdateId={params.update}
          />
          <UpdateEmptyState
            initiativeId={params.initiative}
            initiativeUpdateId={params.update}
            isSubscribed={Boolean(organization.stripeSubscriptionId)}
          />
        </div>
      </div>
    );
  }

  const html = await contentToHtml(content);
  const text = contentToText(content);
  const recipients = members.filter((member) =>
    update.initiative.team.some((team) => team.userId === member.id)
  );

  return (
    <div className="px-6 py-16">
      <div className="mx-auto grid max-w-prose gap-6">
        <div className="grid gap-3">
          <div className="flex items-start justify-between gap-2">
            <p className="m-0 text-muted-foreground text-sm">Subject</p>
            <div className="-space-x-1 flex items-center">
              {recipients.map((recipient) =>
                recipient.user_metadata.image_url ? (
                  <Image
                    alt={getUserName(recipient)}
                    className="h-6 w-6 shrink-0 overflow-hidden rounded-full border-2 border-backdrop object-cover"
                    height={24}
                    key={recipient.id}
                    src={recipient.user_metadata.image_url}
                    width={24}
                  />
                ) : null
              )}
            </div>
          </div>
          <div className="flex items-start justify-between gap-2">
            <InitiativeUpdateTitle
              defaultTitle={update.title}
              editable={
                user.user_metadata.organization_role !== EververseRole.Member
              }
              initiativeUpdateId={params.update}
            />
            {update.emailSentAt ? (
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  className="flex items-center gap-2"
                  disabled
                  variant="outline"
                >
                  <SendIcon size={16} />
                  Sent {formatDate(update.emailSentAt)}
                </Button>
                <InitiativeUpdateCopyContentButton html={html} text={text} />
              </div>
            ) : (
              <InitiativeUpdateSendButton
                recipientCount={recipients.length}
                updateId={params.update}
              />
            )}
          </div>
        </div>
        <StackCard className="grid gap-8 px-6 py-12">
          {content && Object.keys(content).length > 0 ? (
            <InitiativeUpdateEditor
              defaultValue={content}
              editable={
                user.user_metadata.organization_role !== EververseRole.Member
              }
              initiativeUpdateId={params.update}
              subscribed={Boolean(organization.stripeSubscriptionId)}
            />
          ) : (
            <UpdateEmptyState
              initiativeId={params.initiative}
              initiativeUpdateId={params.update}
              isSubscribed={Boolean(organization.stripeSubscriptionId)}
            />
          )}
        </StackCard>
      </div>
    </div>
  );
};

export default InitiativeUpdatePage;
