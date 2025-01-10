import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Logo } from '@repo/design-system/components/logo';
import { Status } from '@repo/observability/status';
import { FooterLink } from './footer-link';

const legal = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Pricing',
    href: '/pricing',
  },
  {
    name: 'Contact',
    href: '/contact',
  },
  {
    name: 'Legal',
    href: '/legal',
  },
];

export const Footer = () => (
  <section className="relative overflow-hidden border-t">
    <Container className="border-x p-4 text-center">
      <div className="flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <Link href="/">
            <Logo showName />
          </Link>
          <p className="text-muted-foreground text-sm">
            &copy; Eververse {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:items-end">
          <div className="col-span-3 flex flex-wrap items-center justify-center gap-8">
            {legal.map(({ href, name }) => (
              <FooterLink key={name} href={href} name={name} />
            ))}
          </div>
          <Status />
        </div>
      </div>
    </Container>
  </section>
);
