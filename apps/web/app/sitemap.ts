import fs from "node:fs";
import { baseUrl } from "@repo/lib/consts";
import type { MetadataRoute } from "next";

const pages = fs
  .readdirSync("app", { withFileTypes: true })
  .filter((file) => file.isDirectory())
  .filter((folder) => !folder.name.startsWith("_"))
  .filter((folder) => !folder.name.startsWith("("))
  .map((folder) => folder.name);

export const runtime = "nodejs";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL(baseUrl).href,
      lastModified: new Date(),
    },
    ...pages.map((page) => ({
      url: new URL(page, baseUrl).href,
      lastModified: new Date(),
    })),
  ];
}
