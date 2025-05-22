'use client';

import type { PlanName } from '@/lib/plans';
import {
  MAX_FREE_CHANGELOGS,
  MAX_FREE_FEATURES,
  MAX_FREE_FEEDBACK,
  MAX_FREE_INITIATIVES,
  MAX_FREE_MEMBERS,
} from '@repo/lib/consts';
import type { Stripe } from '@repo/payments';
import pluralize from 'pluralize';
import { useState } from 'react';
import { AnimatedTabs } from './animated-tabs';
import { PlanCard } from './plan-card';
import type { PlanCardProperties } from './plan-card';

type PlansProperties = {
  readonly products: Stripe.Product[];
  readonly prices: Stripe.Price[];
  readonly currentPlan: PlanName;
};

const getPriceInterval = (price: Stripe.Price) =>
  price.recurring?.interval === 'month' ? 'MONTHLY' : 'YEARLY';

const getPlans = ({
  products,
  prices,
  currentPlan,
  interval,
}: PlansProperties & {
  interval: 'MONTHLY' | 'YEARLY';
}): PlanCardProperties['plan'][] => {
  const plans: PlanCardProperties['plan'][] = [];

  for (const product of products) {
    const productPrices = prices.filter(
      (price) => price.product === product.id && price.active
    );

    plans.push({
      id: product.id,
      name: product.name,
      description: product.description,
      prices: productPrices.map((price) => ({
        interval: getPriceInterval(price),
        id: price.id,
        value: price.unit_amount ? price.unit_amount / 100 : 'Free',
      })),
      cta:
        currentPlan === 'PRO'
          ? null
          : `/api/stripe/checkout?priceId=${
              productPrices.find(
                (price) => getPriceInterval(price) === interval
              )?.id
            }`,
      label: currentPlan === 'PRO' ? 'Current plan' : 'Subscribe',
      features: product.marketing_features
        .map((feature) => feature.name)
        .filter(Boolean) as string[],
    });
  }

  plans.unshift({
    id: 'hobby',
    name: 'Hobby',
    description: 'For individuals',
    prices: [
      {
        interval: 'MONTHLY',
        id: 'free',
        value: 'Free',
      },
      {
        interval: 'YEARLY',
        id: 'free',
        value: 'Free',
      },
    ],
    cta: currentPlan === 'FREE' ? null : '/api/stripe/portal',
    label: currentPlan === 'FREE' ? 'Current plan' : 'Downgrade',
    features: [
      pluralize('user', MAX_FREE_MEMBERS, true),
      pluralize('feedback', MAX_FREE_FEEDBACK, true),
      pluralize('feature', MAX_FREE_FEATURES, true),
      pluralize('changelog', MAX_FREE_CHANGELOGS, true),
      pluralize('initiative', MAX_FREE_INITIATIVES, true),
      'All integrations',
    ],
  });

  plans.push({
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    prices: [
      {
        interval: 'MONTHLY',
        id: 'custom',
        value: 'Get in touch',
      },
      {
        interval: 'YEARLY',
        id: 'custom',
        value: 'Get in touch',
      },
    ],
    cta: currentPlan === 'ENTERPRISE' ? null : 'mailto:hayden@eververse.ai',
    label: currentPlan === 'ENTERPRISE' ? 'Current plan' : 'Get in touch',
    features: [
      '99.99% Uptime SLA',
      'Support SLA',
      'Guided onboarding',
      'Dedicated support',
      'SAML authentication',
      'Audit logs',
    ],
  });

  return plans;
};

export const Plans = ({ products, currentPlan, prices }: PlansProperties) => {
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const plans = getPlans({
    products,
    prices,
    currentPlan,
    interval,
  });

  return (
    <div className="not-prose flex flex-col items-center">
      <div className="relative">
        <AnimatedTabs
          value={interval}
          options={[
            { id: 'MONTHLY', label: 'Monthly' },
            { id: 'YEARLY', label: 'Yearly' },
          ]}
          onChange={(interval) => setInterval(interval as 'MONTHLY' | 'YEARLY')}
        />
        {interval === 'YEARLY' && (
          <p className="-right-20 -rotate-6 absolute top-2 font-medium text-sm text-violet-500">
            Save 20%!
          </p>
        )}
      </div>
      <div className="not-prose mt-8 grid w-full gap-2 sm:grid-cols-3">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            interval={interval}
            previousPlanName={index ? plans[index - 1].name : null}
          />
        ))}
      </div>
    </div>
  );
};
