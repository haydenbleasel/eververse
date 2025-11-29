import { Container } from "@repo/design-system/components/container";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { CTAButton } from "@/app/(home)/components/cta-button";

export const CallToAction = () => (
  <section className="relative overflow-hidden">
    <Container className="border-x p-4">
      <div className="grid gap-4 rounded-xl border bg-background p-8 shadow-sm sm:grid-cols-2 sm:gap-8 sm:p-16">
        <h2 className="mt-0 mb-4 font-semibold text-3xl tracking-tighter sm:text-5xl">
          <Balancer>Build your product roadmap at lightspeed</Balancer>
        </h2>
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground sm:text-xl">
            <Balancer>
              Explore problems, ideate solutions, prioritize features and plan
              your roadmap with the help of AI.
            </Balancer>
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <CTAButton size="lg" />
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                See pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  </section>
);
