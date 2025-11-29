import { Skeleton } from "@repo/design-system/components/precomposed/skeleton";
import { StackCard } from "@repo/design-system/components/stack-card";
import { createMetadata } from "@repo/seo/metadata";
import { CheckIcon, ImportIcon, InfoIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { CannyImportForm } from "./components/canny-import-form";
import { CannyImportsCard } from "./components/canny-imports-card";

const title = "Import from Canny";
const description = "Import your Canny boards, posts and votes into Eververse.";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const CannyImport = () => (
  <div className="grid gap-6">
    <Image
      alt=""
      className="m-0 h-8 w-8"
      height={32}
      src="/canny.svg"
      width={32}
    />
    <div className="grid gap-2">
      <h1 className="m-0 font-semibold text-4xl tracking-tight">{title}</h1>
      <p className="mb-0 text-muted-foreground">{description}</p>
    </div>

    <StackCard
      className="grid gap-2"
      icon={ImportIcon}
      title="Start a new import"
    >
      <CannyImportForm />
      <p className="mb-0 text-muted-foreground text-sm">
        If you want Jira issues to be linked, make sure to integrate Eververse
        with Jira first.
      </p>
    </StackCard>

    <Suspense fallback={<Skeleton className="h-56 w-full" />}>
      <CannyImportsCard />
    </Suspense>

    <StackCard
      className="grid items-start text-sm sm:grid-cols-2"
      icon={CheckIcon}
      title="Supported Canny features"
    >
      <div>
        <p className="font-medium">What gets imported:</p>
        <ul className="mb-0 list-disc space-y-1 pl-4">
          <li>Boards</li>
          <li>Categories</li>
          <li>Changelog Entries</li>
          <li>Comments</li>
          <li>Companies</li>
          <li>Posts</li>
          <li>Status Changes</li>
          <li>Tags</li>
          <li>Users</li>
          <li>Votes</li>
        </ul>
      </div>

      <div>
        <p className="font-medium">What doesn&apos;t get imported:</p>

        <ul className="mb-0 list-disc space-y-1 pl-4">
          <li>Opportunities</li>
          <li>Company Custom Fields</li>
          <li>Post Custom Fields</li>
        </ul>
      </div>
    </StackCard>

    <StackCard icon={InfoIcon} title="Mapping">
      <ul className="mb-0 list-disc space-y-1 pl-4 text-sm">
        <li>Boards are mapped to Products</li>
        <li>Categories are mapped to Groups</li>
        <li>Changelog Entries are imported as-is</li>
        <li>Comments are imported as Feedback</li>
        <li>Companies are imported as-is</li>
        <li>Posts are imported as Features</li>
        <li>Status Changes are imported as-is</li>
        <li>Tags are imported as-is</li>
        <li>Users are imported as-is</li>
        <li>Votes are imported as-is</li>
      </ul>
    </StackCard>
  </div>
);

export default CannyImport;
