import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Logo } from '@repo/design-system/components/logo';
import { Button } from '@repo/design-system/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@repo/design-system/components/ui/navigation-menu';
import { cn } from '@repo/design-system/lib/utils';
import {
  ArrowRightIcon,
  CalendarIcon,
  CodeIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
} from 'lucide-react';
import { LazyMotion, domAnimation } from 'motion/react';

const links = [
  {
    href: '/pricing',
    label: 'Pricing',
    icon: CreditCardIcon,
  },
  {
    href: 'https://x.com/haydenbleasel',
    label: 'Contact',
    icon: MessageSquareIcon,
  },
  {
    href: 'https://eververse.eververse.ai',
    label: 'Roadmap',
    icon: CalendarIcon,
  },
  {
    href: 'https://github.com/haydenbleasel/eververse',
    label: 'Source Code',
    icon: CodeIcon,
  },
];

export const Navbar = () => (
  <LazyMotion features={domAnimation}>
    <nav className="sticky top-0 z-50 border-b">
      <Container className="grid grid-cols-[40px_1fr_40px] items-center gap-4 border-x bg-backdrop/90 py-3 backdrop-blur-sm md:grid-cols-[120px_1fr_120px]">
        <div>
          <Link href="/" className="hidden md:block">
            <Logo showName />
          </Link>
          <Link href="/" className="block md:hidden">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {links.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      '!bg-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Link
                      href={link.href}
                      className="flex flex-row items-center gap-2"
                    >
                      <span className="hidden md:block">{link.label}</span>
                      <span className="block md:hidden">
                        <link.icon size={16} className="shrink-0" />
                      </span>
                      {link.href.includes('http') ? (
                        <ExternalLinkIcon
                          size={16}
                          className="hidden shrink-0 md:block"
                        />
                      ) : null}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex justify-end">
          <Button asChild className="hidden md:flex">
            <a href="https://app.eververse.ai">Get started</a>
          </Button>
          <Button asChild size="icon" className="flex md:hidden">
            <a href="https://app.eververse.ai">
              <ArrowRightIcon size={16} />
            </a>
          </Button>
        </div>
      </Container>
    </nav>
  </LazyMotion>
);
