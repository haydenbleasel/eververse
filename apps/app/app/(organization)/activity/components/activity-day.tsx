import type { User } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import type { feature_source } from "@repo/backend/prisma/client";
import { Link } from "@repo/design-system/components/link";
import { StackCard } from "@repo/design-system/components/stack-card";
import {
  BlocksIcon,
  BoxIcon,
  ClockIcon,
  CodeIcon,
  CompassIcon,
  FilePenIcon,
  FlagIcon,
  FrameIcon,
  GroupIcon,
  LinkIcon,
  MessageCircleIcon,
  UserCircleIcon,
  UserPlusIcon,
} from "lucide-react";
import type { GetActivityResponse } from "@/actions/activity/get";
import { ActivityItem } from "./activity-item";

type ActivityDayProperties = {
  readonly members: User[];
  readonly data: GetActivityResponse;
};

const getIconForSource = (source: feature_source) => {
  switch (source) {
    case "INTERCOM": {
      return "/intercom.svg";
    }
    case "SLACK": {
      return "/slack.svg";
    }
    case "ZAPIER": {
      return "/zapier.svg";
    }
    case "EMAIL": {
      return "/email.svg";
    }
    default: {
      return null;
    }
  }
};

export const ActivityDay = ({ data, members }: ActivityDayProperties) => {
  const getMemberById = (id: User["id"]) =>
    members.find((member) => member.id === id);

  const getMemberName = (id: User["id"]) => {
    const member = getMemberById(id);

    return member ? getUserName(member) : "Someone";
  };

  const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(data.date);

  const items = [
    ...data.members.map((member) => ({
      id: member.id,
      children: <span>{member.userName} joined the organization</span>,
      createdAt: new Date(member.createdAt),
      userImage: member.userImage,
      userName: member.userName,
      userIdentifier: member.id,
      icon: UserCircleIcon,
    })),
    ...data.feedback.map((item) => ({
      id: item.id,
      children: (
        <span>
          {item.feedbackUser?.name ?? "Someone"} from{" "}
          {item.feedbackUser?.feedbackOrganization?.name ?? "an organization"}{" "}
          submitted feedback:{" "}
          <Link
            className="text-primary underline"
            href={`/feedback/${item.id}`}
          >
            {item.title}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: item.feedbackUser?.imageUrl,
      userName: item.feedbackUser?.name,
      userIdentifier: item.feedbackUser?.feedbackOrganization?.name,
      icon: getIconForSource(item.source) ?? MessageCircleIcon,
    })),
    ...data.initiatives.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created a new initiative:{" "}
          <Link
            className="text-primary underline"
            href={`/initiatives/${item.id}`}
          >
            {item.title}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: CompassIcon,
    })),
    ...data.initiativeMembers.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} added{" "}
          {item.userId === item.creatorId
            ? "themselves"
            : getMemberName(item.userId)}{" "}
          to initiative{" "}
          <Link
            className="text-primary underline"
            href={`/initiatives/${item.initiative.id}`}
          >
            {item.initiative.title}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: UserPlusIcon,
    })),
    ...data.initiativePages.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created{" "}
          <Link
            className="text-primary underline"
            href={`/initiatives/${item.initiative.id}/pages/${item.id}`}
          >
            {item.title}
          </Link>{" "}
          in{" "}
          <Link
            className="text-primary underline"
            href={`/initiatives/${item.initiative.id}`}
          >
            {item.initiative.title}
          </Link>
          .
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: FilePenIcon,
    })),
    ...data.initiativeCanvases.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created{" "}
          <Link
            className="text-primary underline"
            href={`/initiatives/${item.initiative.id}/canvases/${item.id}`}
          >
            {item.title}
          </Link>{" "}
          in{" "}
          <Link
            className="text-primary underline"
            href={`/initiatives/${item.initiative.id}`}
          >
            {item.initiative.title}
          </Link>
          .
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: FrameIcon,
    })),
    ...data.initiativeExternalLinks.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} added{" "}
          <Link className="text-primary underline" href={item.href}>
            {item.title}
          </Link>{" "}
          to{" "}
          <Link
            className="text-primary underline"
            href={`/initiatives/${item.initiative.id}`}
          >
            {item.initiative.title}
          </Link>
          .
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: LinkIcon,
    })),
    ...data.products.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created a new product:{" "}
          <Link
            className="text-primary underline"
            href={`/features/products/${item.id}`}
          >
            {item.name}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: BoxIcon,
    })),
    ...data.groups.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created a new group:{" "}
          <Link
            className="text-primary underline"
            href={`/features/groups/${item.id}`}
          >
            {item.name}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: GroupIcon,
    })),
    ...data.features.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created a new feature:{" "}
          <Link
            className="text-primary underline"
            href={`/features/${item.id}`}
          >
            {item.title}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: getIconForSource(item.source) ?? BlocksIcon,
    })),
    ...data.changelog.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created a new product update:{" "}
          <Link
            className="text-primary underline"
            href={`/changelog/${item.id}`}
          >
            {item.title}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: ClockIcon,
    })),
    ...data.apiKeys.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} created a new API key called &quot;
          {item.name}&quot;
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: CodeIcon,
    })),
    ...data.feedbackFeatureLinks.map((item) => ({
      id: item.id,
      children: item.creatorId ? (
        <span>
          {getMemberName(item.creatorId)} linked feedback{" "}
          <Link
            className="text-primary underline"
            href={`/feedback/${item.feedback.id}`}
          >
            {item.feedback.title}
          </Link>{" "}
          to feature{" "}
          <Link
            className="text-primary underline"
            href={`/features/${item.feature.id}`}
          >
            {item.feature.title}
          </Link>
        </span>
      ) : (
        <span>
          <Link
            className="text-primary underline"
            href={`/feedback/${item.feedback.id}`}
          >
            {item.feedback.title}
          </Link>{" "}
          was linked to feature{" "}
          <Link
            className="text-primary underline"
            href={`/features/${item.feature.id}`}
          >
            {item.feature.title}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: item.creatorId
        ? getMemberById(item.creatorId)?.user_metadata?.image_url
        : undefined,
      userName: item.creatorId ? getMemberName(item.creatorId) : undefined,
      userIdentifier: item.creatorId
        ? getMemberById(item.creatorId)?.email
        : undefined,
      icon: MessageCircleIcon,
    })),
    ...data.portalFeatures.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} pushed a feature to the portal:{" "}
          <Link
            className="text-primary underline"
            href={`/features/${item.feature.id}`}
          >
            {item.feature.title}
          </Link>{" "}
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: BlocksIcon,
    })),
    ...data.widgetItems.map((item) => ({
      id: item.id,
      children: (
        <span>
          {getMemberName(item.creatorId)} added a new Widget link:{" "}
          <Link className="text-primary underline" href={item.link}>
            {item.name}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: getMemberById(item.creatorId)?.user_metadata?.image_url,
      userName: getMemberName(item.creatorId),
      userIdentifier: getMemberById(item.creatorId)?.email,
      icon: BlocksIcon,
    })),
    ...data.releases.map((item) => ({
      id: item.id,
      children: item.creatorId ? (
        <span>
          {getMemberName(item.creatorId)} created a new release:{" "}
          <Link
            className="text-primary underline"
            href={`/releases/${item.id}`}
          >
            {item.title}
          </Link>
        </span>
      ) : (
        <span>
          A release was created:{" "}
          <Link
            className="text-primary underline"
            href={`/releases/${item.id}`}
          >
            {item.title}
          </Link>
        </span>
      ),
      createdAt: item.createdAt,
      userImage: item.creatorId
        ? getMemberById(item.creatorId)?.user_metadata?.image_url
        : undefined,
      userName: item.creatorId ? getMemberName(item.creatorId) : undefined,
      userIdentifier: item.creatorId
        ? getMemberById(item.creatorId)?.email
        : undefined,
      icon: FlagIcon,
    })),
  ];

  return (
    <StackCard className="flex flex-col gap-4 p-4" title={date}>
      {items.length === 0 ? (
        <p className="m-0 text-center text-muted-foreground text-sm">
          No activity for this day
        </p>
      ) : (
        items.map((item) => <ActivityItem data={item} key={item.id} />)
      )}
    </StackCard>
  );
};
