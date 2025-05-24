import { env } from '@/env';
import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Logo } from '@repo/design-system/components/logo';
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from '@repo/design-system/components/ui/kibo-ui/status';
import { getStatus } from '@repo/observability/status';
import { FooterLink } from './footer-link';
import { ThemeToggle } from './theme-toggle';

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

export const Footer = async () => {
  const status = await getStatus();

  return (
    <section className="relative overflow-hidden border-t">
      <Container className="grid grid-cols-4 items-start border-x px-4 py-8">
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Logo showName />
          </Link>
          <p className="text-muted-foreground text-sm">
            &copy; Eververse {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <a target="_blank" rel="noreferrer" href={env.BETTERSTACK_URL}>
              <Status
                status={status}
                variant="outline"
                className="rounded-full bg-background px-4 py-[5px] text-sm"
              >
                <StatusIndicator />
                <StatusLabel />
              </Status>
            </a>
            <ThemeToggle />
          </div>
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
};
