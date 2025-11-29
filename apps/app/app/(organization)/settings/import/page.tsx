import { Link } from "@repo/design-system/components/link";
import { StackCard } from "@repo/design-system/components/stack-card";
import { createMetadata } from "@repo/seo/metadata";
import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

const title = "Import from other apps";
const description =
  "Import your feedback, features and components into Eververse.";

const sources = [
  {
    title: "Productboard",
    description: "Import your Notes, Products, Components, Features and more.",
    icon: "/productboard.svg",
    link: "/settings/import/productboard",
  },
  {
    title: "Canny",
    description: "Import your Changelogs, Statuses, Companies and more.",
    icon: "/canny.svg",
    link: "/settings/import/canny",
  },
  {
    title: "Markdown",
    description: "Import Markdown files as Changelogs.",
    icon: "/markdown.svg",
    link: "/settings/import/markdown",
  },
];

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Import = () => (
  <div className="grid gap-6">
    <div className="grid gap-2">
      <h1 className="m-0 font-semibold text-4xl tracking-tight">Import</h1>
      <p className="mt-2 mb-0 text-muted-foreground">
        Import your feedback, features, components and changelogs into Eververse
      </p>
    </div>
    <StackCard className="divide-y p-0">
      {sources.map((source) => (
        <Link
          className="flex items-center gap-4 p-4"
          href={source.link}
          key={source.title}
        >
          <Image
            alt={source.title}
            className="m-0 h-8 w-8 shrink-0 object-contain"
            height={32}
            src={source.icon}
            width={32}
          />
          <span className="block flex-1">
            <span className="block font-medium">{source.title}</span>
            <span className="block text-muted-foreground text-sm">
              {source.description}
            </span>
          </span>
          <ArrowRightIcon
            className="shrink-0 text-muted-foreground"
            size={16}
          />
        </Link>
      ))}
    </StackCard>
  </div>
);

export default Import;
