import { database } from "@repo/backend/database";
import { Container } from "@repo/design-system/components/container";
import { Link } from "@repo/design-system/components/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ModeToggle } from "@/app/components/mode-toggle";
import { getSlug } from "@/lib/slug";
import { CreateIdeaForm } from "./create-idea-form";
import { Tabs } from "./tabs";

export const Navbar = async () => {
  const slug = await getSlug();

  if (!slug) {
    notFound();
  }

  const portal = await database.portal.findFirst({
    where: { slug },
    select: {
      name: true,
      organization: {
        select: {
          stripeSubscriptionId: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!portal) {
    notFound();
  }

  return (
    <div className="border-b bg-background pt-4">
      <Container>
        <nav className="mb-2 flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            {portal.organization.logoUrl ? (
              <Image
                alt=""
                className="h-8 w-8 overflow-hidden rounded object-cover"
                height={32}
                src={portal.organization.logoUrl}
                width={32}
              />
            ) : (
              <div className="h-8 w-8 rounded bg-muted" />
            )}
            <p className="font-semibold">{portal.name}</p>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {portal.organization.stripeSubscriptionId ? (
              <CreateIdeaForm orgName={portal.name} slug={slug} />
            ) : null}
          </div>
        </nav>

        <Tabs />
      </Container>
    </div>
  );
};
