"use server";

import { createClient } from "@repo/atlassian";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export type GetJiraProjectsResponse = {
  readonly projects: {
    id: number;
    image: string;
    title: string;
    key: string;
  }[];
};

export const getJiraProjects = async (): Promise<
  | GetJiraProjectsResponse
  | {
      error: string;
    }
> => {
  try {
    const installation = await database.atlassianInstallation.findFirst({
      select: {
        accessToken: true,
        siteUrl: true,
        email: true,
      },
    });

    if (!installation) {
      throw new Error("Jira installation not found");
    }

    const atlassian = createClient(installation);
    const response = await atlassian.GET("/rest/api/2/project/search");

    if (response.error) {
      throw new Error("Failed to get Jira projects");
    }

    if (!response.data?.values) {
      return { projects: [] };
    }

    const projects = response.data.values.map((project) => ({
      id: Number(project.id ?? ""),
      image: project.avatarUrls?.["48x48"] ?? "",
      title: project.name ?? "",
      key: project.key ?? "",
    }));

    revalidatePath("/features", "page");

    return { projects };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
