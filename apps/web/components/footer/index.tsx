import { Container } from "@repo/design-system/components/container";
import { Link } from "@repo/design-system/components/link";
import { Logo } from "@repo/design-system/components/logo";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@repo/design-system/components/kibo-ui/status";
import { getStatus } from "@repo/observability/status";
import { env } from "@/env";
import { FooterLink } from "./footer-link";
import { ThemeToggle } from "./theme-toggle";

const links = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Pricing",
    href: "/pricing",
  },
  {
    name: "Contact",
    href: "https://x.com/haydenbleasel",
  },
];

const legal = [
  {
    name: "Privacy Policy",
    href: "/legal/privacy",
  },
  {
    name: "Terms of Service",
    href: "/legal/terms",
  },
  {
    name: "Acceptable Use Policy",
    href: "/legal/acceptable-use",
  },
];

export const Footer = async () => {
  const status = await getStatus();

  return (
    <section className="relative overflow-hidden">
      <Container className="grid grid-cols-4 items-start border-x px-4 py-8">
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Logo showName />
          </Link>
          <p className="text-muted-foreground text-sm">
            &copy; Eververse {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <a href={env.BETTERSTACK_URL} rel="noreferrer" target="_blank">
              <Status
                className="rounded-full bg-background px-4 py-[5px] text-sm"
                status={status}
                variant="outline"
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
            <FooterLink href={href} key={name} name={name} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {legal.map(({ href, name }) => (
            <FooterLink href={href} key={name} name={name} />
          ))}
        </div>
      </Container>
    </section>
  );
};
