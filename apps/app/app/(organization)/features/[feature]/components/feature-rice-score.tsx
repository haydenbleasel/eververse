import type { FeatureRice } from "@repo/backend/prisma/client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/design-system/components/ui/hover-card";
import { calculateRice, impactNumberMatrix } from "@/lib/rice";

type FeatureRiceProperties = {
  readonly rice: Pick<
    FeatureRice,
    "confidence" | "effort" | "impact" | "reach"
  >;
};

export const FeatureRiceScore = ({ rice }: FeatureRiceProperties) => (
  <HoverCard closeDelay={0} openDelay={0}>
    <HoverCardTrigger className="hover:underline">
      {calculateRice(rice)}
    </HoverCardTrigger>
    <HoverCardContent className="divide-y bg-background p-0" sideOffset={8}>
      <div className="flex items-center justify-between gap-4 px-3 py-1.5">
        <p>Reach</p>
        <p>{rice.reach}</p>
      </div>
      <div className="flex items-center justify-between gap-4 px-3 py-1.5">
        <p>Impact</p>
        <p>
          {impactNumberMatrix[rice.impact as keyof typeof impactNumberMatrix]}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 px-3 py-1.5">
        <p>Confidence</p>
        <p>{rice.confidence}%</p>
      </div>
      <div className="flex items-center justify-between gap-4 px-3 py-1.5">
        <p>Effort</p>
        <p>{rice.effort}</p>
      </div>
    </HoverCardContent>
  </HoverCard>
);
