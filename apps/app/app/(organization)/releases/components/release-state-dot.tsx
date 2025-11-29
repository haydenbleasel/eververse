import type { Release } from "@repo/backend/prisma/client";
import { colors } from "@repo/design-system/lib/colors";

const getBackgroundColor = (state: Release["state"]) => {
  if (state === "COMPLETED") {
    return colors.emerald;
  }

  if (state === "ACTIVE") {
    return colors.amber;
  }

  if (state === "CANCELLED") {
    return colors.rose;
  }

  return colors.gray;
};

type ReleaseStateDotProps = {
  state: Release["state"];
};

export const ReleaseStateDot = ({ state }: ReleaseStateDotProps) => (
  <div
    className="h-2 w-2 rounded-full"
    style={{ backgroundColor: getBackgroundColor(state) }}
  />
);
