import NumberFlow from "@number-flow/react";
import { Link } from "@repo/design-system/components/link";
import { Button } from "@repo/design-system/components/ui/button";
import { CircleCheckBigIcon } from "lucide-react";

export type PlanCardProperties = {
  readonly interval: "MONTHLY" | "YEARLY";
  readonly previousPlanName: string | null;
  readonly plan: {
    id: string;
    name: string;
    description: string | null;
    prices: {
      interval: PlanCardProperties["interval"];
      id: string;
      value: number | string;
    }[];
    cta: string | null;
    label: string;
    features: string[];
  };
};

export const PlanCard = ({
  plan,
  interval,
  previousPlanName,
}: PlanCardProperties) => {
  const price = plan.prices.find(
    (planPrice) => planPrice.interval === interval
  );

  if (!price) {
    return null;
  }

  const caption = previousPlanName
    ? `Everything in ${previousPlanName}, plus...`
    : "Everything you need to start...";

  return (
    <div
      className="rounded-lg border bg-background p-4 shadow-sm"
      key={plan.id}
    >
      <h2 className="font-semibold">{plan.name}</h2>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <p className="text-muted-foreground text-sm">{plan.description}</p>
        </div>
        <div className="my-4">
          {typeof price.value === "string" ? (
            <p className="font-semibold text-3xl text-foreground">
              {price.value}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <NumberFlow
                className="-my-1 font-semibold text-3xl text-foreground"
                prefix="$"
                value={interval === "YEARLY" ? price.value / 12 : price.value}
              />
              <div className="text-xs">
                <p>per user</p>
                <p>per month</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{caption}</p>
        <div className="my-4 flex flex-col gap-1">
          {plan.features.map((feature) => (
            <div className="flex items-center gap-2" key={feature}>
              <CircleCheckBigIcon className="shrink-0 text-success" size={16} />
              <p className="truncate text-sm">{feature}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          {plan.cta ? (
            <Button asChild>
              <a href={plan.cta} rel="noopener noreferrer" target="_blank">
                {plan.label}
              </a>
            </Button>
          ) : (
            <Button disabled variant="outline">
              Current Plan
            </Button>
          )}
        </div>
        <Link
          className="mt-4 w-full text-center text-muted-foreground text-xs underline"
          href="https://www.eververse.ai/pricing"
        >
          Compare all features
        </Link>
      </div>
    </div>
  );
};
