import { StackCard } from "@repo/design-system/components/stack-card";
import { createMetadata } from "@repo/seo/metadata";
import { ImportIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { MarkdownImportForm } from "./components/markdown-input-form";

const title = "Import Markdown";
const description = "Import your Markdown files as changelogs";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const MarkdownImport = () => (
  <div className="grid gap-6">
    <Image
      alt=""
      className="m-0 h-8 w-8"
      height={32}
      src="/markdown.svg"
      width={32}
    />
    <div className="grid gap-2">
      <h1 className="m-0 font-semibold text-4xl tracking-tight">{title}</h1>
      <p className="mt-2 mb-0 text-muted-foreground">{description}</p>
    </div>
    <StackCard className="p-0" icon={ImportIcon} title="Start a new import">
      <MarkdownImportForm />
    </StackCard>
  </div>
);

export default MarkdownImport;
