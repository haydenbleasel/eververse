import { currentOrganizationId } from "@repo/backend/auth/utils";
import { StackCard } from "@repo/design-system/components/stack-card";
import { formatDate } from "@repo/lib/format";
import { SparklesIcon } from "lucide-react";
import { MemoizedReactMarkdown } from "@/components/markdown";
import { database } from "@/lib/database";

const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

export const Digest = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return null;
  }

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      feedback: {
        where: {
          createdAt: {
            gte: lastDay,
          },
        },
      },
      features: {
        where: {
          createdAt: {
            gte: lastDay,
          },
        },
      },
      digests: {
        select: {
          summary: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!databaseOrganization) {
    return null;
  }

  const aiDigest = databaseOrganization.digests.at(0)?.summary;
  const basicDigest = [
    "Welcome back! In the last 24 hours, you received",
    `${databaseOrganization.feedback.length} feedback items, and`,
    `${databaseOrganization.features.length} features were created.`,
  ].join(" ");

  if (aiDigest) {
    return (
      <StackCard
        title={
          <span className="text-primary">
            <SparklesIcon className="inline-block align-text-top" size={16} />{" "}
            AI Digest for {formatDate(lastDay)}
          </span>
        }
      >
        <MemoizedReactMarkdown>{aiDigest}</MemoizedReactMarkdown>
      </StackCard>
    );
  }

  return (
    <StackCard title={`Digest for ${formatDate(lastDay)}`}>
      <p className="text-muted-foreground">{basicDigest}</p>
    </StackCard>
  );
};
