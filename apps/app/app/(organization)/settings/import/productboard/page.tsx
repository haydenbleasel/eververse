import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { StackCard } from '@repo/design-system/components/stack-card';
import { createMetadata } from '@repo/seo/metadata';
import { CheckIcon, ImportIcon, InfoIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { ProductboardImportForm } from './components/productboard-import-form';
import { ProductboardImportsCard } from './components/productboard-imports-card';

const title = 'Import from Productboard';
const description =
  'Import your Productboard notes, features and components into Eververse.';

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const ProductboardImport = () => (
  <div className="grid gap-6">
    <Image
      src="/productboard.svg"
      width={32}
      height={32}
      className="m-0 h-8 w-8"
      alt=""
    />
    <div>
      <h1 className="m-0 font-semibold text-4xl">{title}</h1>
      <p className="mt-2 mb-0 text-muted-foreground">{description}</p>
    </div>

    <StackCard title="Start a new import" icon={ImportIcon}>
      <ProductboardImportForm />
      <p className="mb-0 text-muted-foreground text-sm">
        If you want Jira issues to be linked, make sure to integrate Eververse
        with Jira first. Similarly, if you want Feature owners to be preserved,
        make sure to invite those owners to Eververse first under the same
        email.
      </p>
    </StackCard>

    <Suspense fallback={<Skeleton className="h-56 w-full" />}>
      <ProductboardImportsCard />
    </Suspense>

    <StackCard
      title="Supported Productboard features"
      icon={CheckIcon}
      className="grid items-start text-sm sm:grid-cols-2"
    >
      <div>
        <p className="font-medium">What gets imported:</p>
        <ul className="mb-0">
          <li>Notes</li>
          <li>Features</li>
          <li>Users</li>
          <li>Companies</li>
          <li>Tags</li>
          <li>Products</li>
          <li>Components</li>
          <li>Feature Statuses</li>
          <li>Custom Fields</li>
          <li>Releases</li>
          <li>Linked Jira Issues</li>
        </ul>
      </div>

      <div>
        <p className="font-medium">What doesn&apos;t get imported:</p>

        <ul className="mb-0">
          <li>Drivers and Scores</li>
          <li>Product Portal</li>
          <li>Objectives</li>
          <li>Tasks</li>
          <li>Other Integrations</li>
          <li>Competitor Fields</li>
          <li>Members</li>
          <li>Teams</li>
          <li>Release Groups</li>
        </ul>
      </div>
    </StackCard>

    <StackCard title="Mapping" icon={InfoIcon}>
      <ul className="mb-0 text-sm">
        <li>Notes are imported as Feedback</li>
        <li>Features are imported as-is</li>
        <li>Users are imported as-is</li>
        <li>Companies are imported as-is</li>
        <li>Tags are imported as-is</li>
        <li>Products are imported as-is</li>
        <li>Components are imported as Groups</li>
        <li>Feature Statuses are imported as-is</li>
        <li>Custom Fields are imported as-is</li>
        <li>Releases are imported as-is</li>
        <li>Linked Jira Issues are imported as-is</li>
      </ul>
    </StackCard>
  </div>
);

export default ProductboardImport;
