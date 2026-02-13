import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { ExportButton } from "./components/export-button";

const title = "Export";
const description = "Download your organization's data as CSV files.";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Export = () => (
  <div className="grid gap-6">
    <div className="grid gap-2">
      <h1 className="m-0 font-semibold text-4xl tracking-tight">{title}</h1>
      <p className="mt-2 mb-0 text-muted-foreground">{description}</p>
    </div>
    <p className="text-muted-foreground text-sm">
      Export all your organization's data as a zip of CSV files. This includes
      features, feedback, initiatives, changelogs, releases, products, groups,
      tags, drivers, portal data, RICE scores, custom fields, assignments and
      more.
    </p>
    <ExportButton />
  </div>
);

export default Export;
