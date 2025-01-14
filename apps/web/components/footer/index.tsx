import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Logo } from '@repo/design-system/components/logo';
import { Status } from '@repo/observability/status';
import { FooterLink } from './footer-link';

const links = [
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

const legal = [
  {
    name: 'Privacy Policy',
    href: '/legal/privacy',
  },
  {
    name: 'Terms of Service',
    href: '/legal/terms',
  },
  {
    name: 'Acceptable Use Policy',
    href: '/legal/acceptable-use',
  },
];

export const Footer = () => (
  <section className="relative overflow-hidden border-t">
    <Container className="grid grid-cols-4 items-start border-x px-4 py-8">
      <div className="flex flex-col gap-4">
        <Link href="/">
          <Logo showName />
        </Link>
        <p className="text-muted-foreground text-sm">
          &copy; Eververse {new Date().getFullYear()}. All rights reserved.
        </p>
        <Status />
      </div>
      <div className="col-start-3 flex flex-col gap-4">
        {links.map(({ href, name }) => (
          <FooterLink key={name} href={href} name={name} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {legal.map(({ href, name }) => (
          <FooterLink key={name} href={href} name={name} />
        ))}
      </div>
    </Container>
  </section>
);
