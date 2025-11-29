"use client";

import type {
  AtlassianInstallation,
  FeatureStatus,
  InstallationStatusMapping,
} from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { updateJiraStatusMappings } from "@/actions/installation-status-mapping/jira/update";
import { JiraStatusMappingPicker } from "./jira-status-mapping-picker";

type JiraStatusMappingTableProps = {
  featureStatuses: Pick<FeatureStatus, "id" | "name" | "color">[];
  statusMappings: Pick<
    InstallationStatusMapping,
    "id" | "eventType" | "featureStatusId" | "eventId"
  >[];
  jiraStatuses: {
    state: string | undefined;
    label: string;
    value: string;
  }[];
  installationId: AtlassianInstallation["id"];
};

export const JiraStatusMappingTable = ({
  featureStatuses,
  jiraStatuses,
  statusMappings,
  installationId,
}: JiraStatusMappingTableProps) => {
  const defaultMap: Record<string, string[]> = {};

  for (const status of featureStatuses) {
    defaultMap[status.id] = statusMappings
      .filter((mapping) => mapping.featureStatusId === status.id)
      .map((mapping) => mapping.eventId ?? "")
      .filter(Boolean);
  }

  const [map, setMap] = useState<Record<string, string[]>>(defaultMap);

  const handleChange = async (
    jiraStatusIds: string[],
    featureStatusId: string
  ) => {
    setMap((prev) => ({
      ...prev,
      [featureStatusId]: jiraStatusIds,
    }));

    try {
      const newJiraStatuses = jiraStatuses.filter((status) =>
        jiraStatusIds.includes(status.value)
      );

      const response = await updateJiraStatusMappings(
        installationId,
        featureStatusId,
        newJiraStatuses
      );

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div>
      {featureStatuses.map((status) => (
        <div
          className="flex items-center justify-between gap-3 px-3 py-1.5"
          key={status.id}
        >
          <div className="flex-1">
            <JiraStatusMappingPicker
              defaultValue={statusMappings
                .filter((mapping) => mapping.featureStatusId === status.id)
                .map((mapping) => mapping.eventId ?? "")
                .filter(Boolean)}
              onChange={(eventTypes) => handleChange(eventTypes, status.id)}
              options={jiraStatuses.filter(
                (jiraStatus) =>
                  map[status.id].includes(jiraStatus.value) ||
                  !Object.values(map).flat().includes(jiraStatus.value)
              )}
            />
          </div>
          <div className="flex h-9 shrink-0 items-center justify-center">
            <ArrowRightIcon className="text-muted-foreground" size={16} />
          </div>
          <div className="flex-1">
            <div className="flex h-9 w-full items-center gap-2 rounded-md border p-3 text-sm shadow-sm">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
