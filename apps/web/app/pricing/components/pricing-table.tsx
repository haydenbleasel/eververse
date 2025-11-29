"use client";

import NumberFlow from "@number-flow/react";
import { Link } from "@repo/design-system/components/link";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { Switch } from "@repo/design-system/components/ui/switch";
import { cn } from "@repo/design-system/lib/utils";
import {
  MAX_FREE_CHANGELOGS,
  MAX_FREE_FEATURES,
  MAX_FREE_FEEDBACK,
  MAX_FREE_INITIATIVE_PAGES,
  MAX_FREE_INITIATIVE_UPDATES,
  MAX_FREE_INITIATIVES,
  MAX_FREE_MEMBERS,
  MAX_FREE_RELEASES,
} from "@repo/lib/consts";
import { CheckIcon, HelpCircleIcon } from "lucide-react";
import { useState } from "react";

const groups = [
  {
    name: "Workspace",
    features: [
      {
        label: "Users",
        description: "Invite your team to your workspace.",
        plans: [MAX_FREE_MEMBERS, "Unlimited", "Unlimited"],
      },
      {
        label: "AI Digest",
        description: "Get a daily digest of your workspace activity.",
        plans: [false, true, true],
      },
      {
        label: "Presence",
        description: "See who’s online.",
        plans: [false, true, true],
      },
      {
        label: "Multifactor authentication",
        description: "Add an extra layer of security.",
        plans: [false, false, true],
      },
      {
        label: "Advanced SSO",
        description: "Sign up with custom SAML SSO.",
        plans: [false, false, true],
      },
    ],
  },
  {
    name: "Initiatives",
    features: [
      {
        label: "Create initiatives",
        description: "Track your team’s initiatives.",
        plans: [MAX_FREE_INITIATIVES, "Unlimited", "Unlimited"],
      },
      {
        label: "Pages",
        description: "Create documents and canvases.",
        plans: [MAX_FREE_INITIATIVE_PAGES, true, true],
      },
      {
        label: "Send email updates",
        description: "Send email updates to your team.",
        plans: [MAX_FREE_INITIATIVE_UPDATES, true, true],
      },
      {
        label: "Add external links",
        description: "Link to external resources.",
        plans: [true, true, true],
      },
      {
        label: "Tailored roadmap",
        description: "Generate a tailored roadmap for your initiative.",
        plans: [true, true, true],
      },
      {
        label: "AI Q&A",
        description: "Ask AI questions about your initiative.",
        plans: [false, true, true],
      },
      {
        label: "AI-generated updates",
        description: "Automatically generate updates for your initiative.",
        plans: [false, true, true],
      },
    ],
  },
  {
    name: "Feedback",
    features: [
      {
        label: "Add feedback",
        description: "Collate feedback from your ecosystem.",
        plans: [MAX_FREE_FEEDBACK, "Unlimited", "Unlimited"],
      },
      {
        label: "Triage feedback",
        description: "Connect feedback to features.",
        plans: [true, true, true],
      },
      {
        label: "Audio and video feedback",
        description: "Upload audio and video feedback.",
        plans: [false, true, true],
      },
      {
        label: "AI sentiment detection",
        description: "Detect emotions in feedback.",
        plans: [false, true, true],
      },
      {
        label: "AI analysis",
        description:
          "Analyze feedback to extract pain points, desired outcomes and more.",
        plans: [false, true, true],
      },
      {
        label: "AI transcription",
        description: "Transcribe audio and video feedback.",
        plans: [false, true, true],
      },
    ],
  },
  {
    name: "Features",
    features: [
      {
        label: "Create features",
        description: "Track feature requests from users.",
        plans: [MAX_FREE_FEATURES, "Unlimited", "Unlimited"],
      },
      {
        label: "Groups and products",
        description: "Organize features into collections.",
        plans: [true, true, true],
      },
      {
        label: "RICE scoring",
        description: "Prioritize features with RICE scoring.",
        plans: [true, true, true],
      },
      {
        label: "Canvas",
        description: "Brainstorm solutions on a visual canvas.",
        plans: [true, true, true],
      },
      {
        label: "Customizable statuses",
        description: "Create your own statuses.",
        plans: [false, true, true],
      },
      {
        label: "AI RICE scoring",
        description: "Automatically best-guess prioritization.",
        plans: [false, true, true],
      },
      {
        label: "Custom fields",
        description: "Add custom fields to your features.",
        plans: [false, true, true],
      },
      {
        label: "AI-assisted writing",
        description: "Get writing suggestions from AI.",
        plans: [false, true, true],
      },
    ],
  },
  {
    name: "Roadmap",
    features: [
      {
        label: "Create roadmap",
        description: "Create a private roadmap for your team.",
        plans: [true, true, true],
      },
      {
        label: "Roadmap customization",
        description: "Modify timeframe, grouping and more.",
        plans: [true, true, true],
      },
      {
        label: "Roadmap events",
        description: "Add events to your roadmap.",
        plans: [true, true, true],
      },
    ],
  },
  {
    name: "Activity",
    features: [
      {
        label: "Activity feed",
        description: "See your team’s activity.",
        plans: [true, true, true],
      },
      {
        label: "Audit logs",
        description: "Track changes in your workspace.",
        plans: [false, false, true],
      },
    ],
  },
  {
    name: "Changelog",
    features: [
      {
        label: "Create changelog",
        description: "Share product updates with customers.",
        plans: [MAX_FREE_CHANGELOGS, "Unlimited", "Unlimited"],
      },
      {
        label: "AI-generated updates",
        description: "Automatically create changelog updates.",
        plans: [false, true, true],
      },
    ],
  },
  {
    name: "Integrations",
    features: [
      {
        label: "Import",
        description: "Import data from Productboard, Canny and Markdown files.",
        plans: [true, true, true],
      },
      {
        label: "Jira",
        description: "Sync Eververse features to Jira tickets.",
        plans: [true, true, true],
      },
      {
        label: "GitHub",
        description: "Sync Eververse features to GitHub issues.",
        plans: [true, true, true],
      },
      {
        label: "Linear",
        description: "Sync Eververse features to Linear issues.",
        plans: [true, true, true],
      },
      {
        label: "Intercom",
        description: "Create Eververse feedback from Intercom conversations.",
        plans: [true, true, true],
      },
      {
        label: "Slack",
        description: "Send feedback notifications to Slack.",
        plans: [true, true, true],
      },
      {
        label: "Zapier",
        description: "Connect with 2000+ apps.",
        plans: [true, true, true],
      },
      {
        label: "Email",
        description: "Forward feedback from your inbox.",
        plans: [true, true, true],
      },
      {
        label: "API",
        description: "Build custom integrations.",
        plans: [false, true, true],
      },
    ],
  },
  {
    name: "Portal",
    features: [
      {
        label: "Portal",
        description: "Customize your feedback portal",
        plans: [true, true, true],
      },
      {
        label: "Portal roadmap",
        description: "Share your roadmap with customers.",
        plans: [true, true, true],
      },
      {
        label: "Customize portal statuses",
        description: "Map your statuses to your customers.",
        plans: [true, true, true],
      },
      {
        label: "Portal changelog",
        description: "Share product updates with customers.",
        plans: [true, true, true],
      },
      {
        label: "Feature voting",
        description: "Let customers vote on features.",
        plans: [false, true, true],
      },
      {
        label: "Idea submission",
        description: "Let customers submit their own ideas.",
        plans: [false, true, true],
      },
    ],
  },
  {
    name: "Widget",
    features: [
      {
        label: "Create a widget",
        description: "Embed your roadmap and changelog.",
        plans: [true, true, true],
      },
      {
        label: "Collect feedback",
        description: "Let users submit feedback in your widget.",
        plans: [true, true, true],
      },
      {
        label: "Recent updates",
        description: "Show recent updates in your widget.",
        plans: [true, true, true],
      },
      {
        label: "Upcoming features",
        description: "Show upcoming features in your widget.",
        plans: [true, true, true],
      },
      {
        label: "Custom links",
        description: "Add custom links to your widget.",
        plans: [false, true, true],
      },
    ],
  },
  {
    name: "Releases",
    features: [
      {
        label: "Create releases",
        description: "Manage your product releases and link features.",
        plans: [MAX_FREE_RELEASES, true, true],
      },
      {
        label: "Sync with Jira",
        description: "Sync Eververse Releases with Jira Fix Versions.",
        plans: [true, true, true],
      },
    ],
  },
  {
    name: "Data",
    features: [
      {
        label: "Users",
        description: "Keep track of every user who has submitted feedback.",
        plans: [true, true, true],
      },
      {
        label: "Companies",
        description: "Keep track of every company that has submitted feedback.",
        plans: [true, true, true],
      },
      {
        label: "Enrichment",
        description: "Automatically enrich user and company data.",
        plans: [false, false, true],
      },
      {
        label: "Segmentation",
        description: "Segment your users and companies.",
        plans: [false, false, true],
      },
    ],
  },
];

export const PricingTable = ({
  monthlyPrice,
  annualPrice,
}: {
  monthlyPrice: number;
  annualPrice: number;
}) => {
  const [yearly, setYearly] = useState(false);
  const plans = [
    {
      name: "Hobby",
      description: "For getting started",
      prices: {
        monthly: "Free forever",
        yearly: "Free forever",
      },
      cta: "Get started for free",
      link: "https://app.eververse.ai/",
      caption: "No credit card required.",
    },
    {
      name: "Pro",
      description: "For small teams",
      prices: {
        monthly: monthlyPrice,
        yearly: annualPrice,
      },
      cta: "Start your free trial",
      link: "https://app.eververse.ai/",
      caption: `Billed ${yearly ? "annually" : "monthly"}.`,
    },
    {
      name: "Enterprise",
      description: "For large teams",
      prices: {
        monthly: "Custom",
        yearly: "Custom",
      },
      cta: "Get in touch",
      link: "https://x.com/haydenbleasel",
      caption: "Let's chat.",
    },
  ];

  const [mobilePlan, setMobilePlan] = useState(plans[0]?.name);

  return (
    <section className="flex flex-col gap-8 pt-8 pb-16 sm:px-8">
      {/* Pricing Toggle */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm ${yearly ? "text-muted-foreground" : "font-medium text-primary"}`}
          >
            Monthly
          </span>
          <Switch
            checked={yearly}
            className="data-[state=checked]:bg-primary"
            onCheckedChange={setYearly}
          />
          <span
            className={`text-sm ${yearly ? "font-medium text-primary" : "text-muted-foreground"}`}
          >
            Yearly{" "}
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
              Save 20%
            </span>
          </span>
        </div>
      </div>
      <div className="block md:hidden">
        <Select
          data={plans.map((plan) => ({
            value: plan.name,
            label: plan.name,
          }))}
          label="Choose a plan"
          onChange={setMobilePlan}
          type="plan"
          value={mobilePlan}
        />
      </div>
      <div className="not-prose">
        <div className="grid grid-cols-2 md:grid-cols-4">
          <div>
            <div className="h-[220px]" />
            {groups.map((group) => (
              <div className="space-y-4 py-8" key={group.name}>
                <p className="text-left font-medium text-muted-foreground text-sm">
                  {group.name}
                </p>
                <div className="grid divide-y">
                  {group.features.map((feature) => (
                    <div
                      className="flex h-10 items-center gap-2"
                      key={feature.label}
                    >
                      <p className="truncate font-medium text-sm">
                        {feature.label}
                      </p>
                      <Tooltip
                        content={
                          <p className="font-medium text-sm">
                            {feature.description}
                          </p>
                        }
                      >
                        <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {plans.map((plan, planIndex) => (
            <div
              className={cn(
                "rounded-lg py-8",
                "hidden sm:block",
                mobilePlan === plan.name && "block",
                planIndex === 1 &&
                  "sm:bg-background sm:shadow-sm sm:ring-1 sm:ring-border"
              )}
              key={plan.name}
            >
              <div className="text-center">
                <p className="truncate font-medium">{plan.name}</p>
                <p className="truncate text-muted-foreground text-sm">
                  {plan.description}
                </p>
                <div className="my-4 h-7">
                  {typeof plan.prices.monthly === "number" &&
                  typeof plan.prices.yearly === "number" ? (
                    <div className="inline-flex items-center gap-1 truncate text-muted-foreground text-sm">
                      <NumberFlow
                        className="font-semibold text-foreground text-xl"
                        prefix="$"
                        value={
                          plan.prices[yearly ? "yearly" : "monthly"] as number
                        }
                      />
                      <p>per user/month</p>
                    </div>
                  ) : (
                    <p className="truncate font-semibold text-foreground text-xl">
                      {plan.prices.monthly}
                    </p>
                  )}
                </div>
                <div className="my-4">
                  <Button asChild>
                    <Link href={plan.link}>{plan.cta}</Link>
                  </Button>
                  <small className="mt-4 block truncate text-muted-foreground text-xs">
                    {plan.caption}
                  </small>
                </div>
              </div>
              {groups.map((group) => (
                <div className="space-y-4 py-8" key={group.name}>
                  <div className="h-5" />
                  <div className="grid divide-y">
                    {group.features.map((feature, featureIndex) => (
                      <div
                        className="flex h-10 items-center justify-center"
                        key={featureIndex}
                      >
                        {typeof feature.plans[planIndex] === "boolean" &&
                        feature.plans[planIndex] ? (
                          <CheckIcon className="h-5 w-5 text-success" />
                        ) : null}
                        {typeof feature.plans[planIndex] !== "boolean" && (
                          <p className="font-medium text-sm">
                            {feature.plans[planIndex]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
