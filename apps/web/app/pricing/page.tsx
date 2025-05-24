import { env } from '@/env';
import Climate from '@repo/design-system/components/climate';
import { Container } from '@repo/design-system/components/container';
import { stripe } from '@repo/payments';
import type { Metadata } from 'next';
import { PricingTable } from './components/pricing-table';
const title = 'Simple, transparent pricing';
const description =
  'No hidden fees. No surprises. 15-day trial. Cancel anytime.';

export const metadata: Metadata = {
  title,
  description,
};

const Pricing = async () => {
  const prices = await stripe.prices.list({
    product: env.STRIPE_PRODUCT_PRO_ID,
  });

  const monthlyPrice = prices.data.find(
    (price) => price.recurring?.interval === 'month'
  )?.unit_amount;

  const annualPrice = prices.data.find(
    (price) => price.recurring?.interval === 'year'
  )?.unit_amount;

  if (!monthlyPrice || !annualPrice) {
    throw new Error('No prices found');
  }

  return (
    <Container className="border-x p-4 pt-16 text-center">
      <header className="flex flex-col items-center gap-4">
        <h1 className="mb-0 pr-1 text-center font-semibold text-[2.125rem] tracking-tighter sm:text-5xl">
          {title}
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          {description}
        </p>
      </header>
      <PricingTable
        monthlyPrice={monthlyPrice / 100}
        annualPrice={annualPrice / 100 / 12}
      />
      <div className="flex justify-center py-16">
        <Climate />
      </div>
    </Container>
  );
};

export default Pricing;
