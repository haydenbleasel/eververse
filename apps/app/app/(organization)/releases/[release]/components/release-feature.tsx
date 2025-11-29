import type { User } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import { getJsonColumnFromTable } from "@repo/backend/database";
import type { Feature } from "@repo/backend/prisma/client";
import { contentToText } from "@repo/editor/lib/tiptap";
import { FeatureItem } from "@/app/(organization)/features/components/feature-item";
import { database } from "@/lib/database";

type ReleaseFeatureProps = {
  id: Feature["id"];
  owner: User | undefined;
};

export const ReleaseFeature = async ({ id, owner }: ReleaseFeatureProps) => {
  const feature = await database.feature.findUnique({
    where: { id },
    select: {
      endAt: true,
      id: true,
      ownerId: true,
      startAt: true,
      title: true,
    },
  });

  if (!feature) {
    return null;
  }

  const content = await getJsonColumnFromTable(
    "feature",
    "content",
    feature.id
  );
  const text = content ? contentToText(content) : "No description yet.";

  return (
    <FeatureItem
      feature={{
        endAt: feature.endAt,
        id: feature.id,
        owner: owner
          ? {
              email: owner.email ?? "",
              imageUrl: owner.user_metadata.image_url ?? "",
              name: getUserName(owner),
            }
          : null,
        ownerId: feature.ownerId,
        startAt: feature.startAt,
        title: feature.title,
        text,
      }}
      key={feature.id}
    />
  );
};
