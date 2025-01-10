import { Container } from '@repo/design-system/components/container';
import { Prose } from '@repo/design-system/components/prose';
import { ArrowRightIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

const title = 'Legal';
const description = 'Legal information for Eververse.';

export const metadata: Metadata = {
  title,
  description,
};

const links = [
  {
    href: '/legal/privacy',
    label: 'Privacy Policy',
  },
  {
    href: '/legal/terms',
    label: 'Terms of Service',
  },
  {
    href: '/legal/acceptable-use',
    label: 'Acceptable Use Policy',
  },
];

const Legal = () => (
  <Container className="border-x p-4 pt-16 text-center">
    <Prose className="max-w-none">
      <header className="flex flex-col items-center">
        <h1 className="mb-0 pr-1 text-center font-semibold text-[2.125rem] tracking-tighter sm:text-5xl">
          {title}
        </h1>
        <p className="text-center text-lg">{description}</p>
      </header>
    </Prose>
    <div className="mx-auto grid max-w-prose divide-y py-16">
      {links.map((link) => (
        <Link
          className="flex items-center justify-between py-8"
          key={link.href}
          href={link.href}
        >
          {link.label}
          <ArrowRightIcon size={16} />
        </Link>
      ))}
    </div>
  </Container>
);

export default Legal;
