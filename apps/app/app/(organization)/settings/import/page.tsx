import { Link } from '@repo/design-system/components/link';
import { createMetadata } from '@repo/seo/metadata';
import { ArrowRightIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

const title = 'Import from other apps';
const description =
  'Import your feedback, features and components into Eververse.';

const sources = [
  {
    title: 'Productboard',
    description: 'Import your Notes, Products, Components, Features and more.',
    icon: '/productboard.svg',
    link: '/settings/import/productboard',
  },
  {
    title: 'Canny',
    description: 'Import your Changelogs, Statuses, Companies and more.',
    icon: '/canny.svg',
    link: '/settings/import/canny',
  },
  {
    title: 'Markdown',
    description: 'Import Markdown files as Changelogs.',
    icon: '/markdown.svg',
    link: '/settings/import/markdown',
  },
];

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Import = () => (
  <div className="grid gap-6">
    <div>
      <h1 className="m-0 font-semibold text-4xl">Import</h1>
      <p className="mt-2 mb-0 text-muted-foreground">
        Import your feedback, features, components and changelogs into Eververse
      </p>
    </div>
    <div className="not-prose divide-y">
      {sources.map((source) => (
        <Link
          key={source.title}
          href={source.link}
          className="flex items-center gap-4 py-6"
        >
          <Image
            src={source.icon}
            alt={source.title}
            width={32}
            height={32}
            className="m-0 h-8 w-8 shrink-0 object-contain"
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
    </div>
  </div>
);

export default Import;
