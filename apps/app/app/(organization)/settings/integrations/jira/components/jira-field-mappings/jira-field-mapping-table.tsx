"use client";

import type {
  AtlassianInstallation,
  InstallationFieldMapping,
} from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import { ArrowRightIcon, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { updateJiraFieldMappings } from "@/actions/installation-field-mapping/jira/update";
import { JiraFieldMappingPicker } from "./jira-field-mapping-picker";

type JiraFieldMappingTableProps = {
  fieldMappings: Pick<
    InstallationFieldMapping,
    "id" | "internalId" | "externalId"
  >[];
  jiraFields: {
    label: string;
    value: string;
    type: string;
  }[];
  installationId: AtlassianInstallation["id"];
};

const fields: {
  value: InstallationFieldMapping["internalId"];
  label: string;
  internalType: InstallationFieldMapping["internalType"];
  icon: typeof CalendarIcon;
  acceptedTypes: string[];
}[] = [
  {
    value: "STARTAT",
    label: "Start Date",
    internalType: "DATE",
    icon: CalendarIcon,
    acceptedTypes: ["datetime", "date"],
  },
  {
    value: "ENDAT",
    label: "End Date",
    internalType: "DATE",
    icon: CalendarIcon,
    acceptedTypes: ["datetime", "date"],
  },
  // { value: 'OWNERID', label: 'Owner', type: 'USER' },
];

export const JiraFieldMappingTable = ({
  jiraFields,
  fieldMappings,
  installationId,
}: JiraFieldMappingTableProps) => {
  const defaultMap: Record<string, string[]> = {};

  for (const field of fields) {
    defaultMap[field.value] = fieldMappings
      .filter((mapping) => mapping.internalId === field.value)
      .map((mapping) => mapping.externalId ?? "")
      .filter(Boolean);
  }

  const [map, setMap] = useState<Record<string, string[]>>(defaultMap);

  const handleChange = async (
    jiraExternalIds: string[],
    field: (typeof fields)[number]
  ) => {
    setMap((prev) => ({
      ...prev,
      [field.value]: jiraExternalIds,
    }));

    try {
      const externals = jiraFields
        .filter((field) => jiraExternalIds.includes(field.value))
        .map((field) => ({
          id: field.value,
          type: field.type,
        }));

      const internal = {
        id: field.value,
        type: field.internalType,
      };

      const response = await updateJiraFieldMappings(
        installationId,
        internal,
        externals
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
      {fields.map((field) => (
        <div
          className="flex items-center justify-between gap-3 px-3 py-1.5"
          key={field.value}
        >
          <div className="flex-1">
            <JiraFieldMappingPicker
              acceptedTypes={field.acceptedTypes}
              defaultValue={fieldMappings
                .filter((mapping) => mapping.internalId === field.value)
                .map((mapping) => mapping.externalId ?? "")
                .filter(Boolean)}
              onChange={(jiraExternalIds) =>
                handleChange(jiraExternalIds, field)
              }
              options={jiraFields.filter(
                (jiraField) =>
                  map[field.value].includes(jiraField.value) ||
                  !Object.values(map).flat().includes(jiraField.value)
              )}
            />
          </div>
          <div className="flex h-9 shrink-0 items-center justify-center">
            <ArrowRightIcon className="text-muted-foreground" size={16} />
          </div>
          <div className="flex-1">
            <div className="flex h-9 w-full items-center gap-2 rounded-md border p-3 text-sm shadow-sm">
              <field.icon className="text-muted-foreground" size={16} />
              {field.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
