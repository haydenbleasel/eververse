"use client";

import type { Initiative, InitiativeUpdate } from "@repo/backend/prisma/client";
import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { handleError } from "@repo/design-system/lib/handle-error";
import { PencilIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { generateInitiativeUpdateContent } from "@/actions/initiative-update/generate";
import { createInitiativeUpdateContent } from "../actions/create-initiative-update-content";

type UpdateEmptyStateProperties = {
  initiativeId: Initiative["id"];
  initiativeUpdateId: InitiativeUpdate["id"];
  isSubscribed: boolean;
};

export const UpdateEmptyState = ({
  initiativeId,
  initiativeUpdateId,
  isSubscribed,
}: UpdateEmptyStateProperties) => {
  const [loading, setLoading] = useState(false);
  const startTypes = [
    {
      id: "ai",
      label: "Generate with AI",
      description: isSubscribed
        ? "Eververse will generate an update for you based on changes since the last update."
        : "Upgrade to a paid plan to generate updates with AI.",
      icon: SparklesIcon,
      disabled: !isSubscribed || loading,
    },
    {
      id: "scratch",
      label: "Start from scratch",
      description: "Write your own update from scratch, no AI involved.",
      icon: PencilIcon,
      disabled: loading,
    },
  ];

  const handleClick = async (id: string) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const createContent =
        id === "ai"
          ? generateInitiativeUpdateContent
          : createInitiativeUpdateContent;
      const response = await createContent(initiativeId, initiativeUpdateId);

      if ("error" in response) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingCircle />;
  }

  return (
    <div className="grid w-full grid-cols-2 gap-4">
      {startTypes.map((option) => (
        <button
          className="space-y-2 rounded border bg-background p-4 transition-colors hover:bg-card"
          disabled={option.disabled}
          key={option.id}
          onClick={() => handleClick(option.id)}
          type="button"
        >
          <option.icon
            className="pointer-events-none mx-auto select-none text-muted-foreground"
            size={24}
          />
          <span className="pointer-events-none mt-2 block select-none font-medium text-sm">
            {option.label}
          </span>
          <span className="pointer-events-none block select-none text-muted-foreground text-sm">
            {option.description}
          </span>
        </button>
      ))}
    </div>
  );
};
