import { handleAuthedState } from '@/lib/auth';
import { Link } from '@repo/design-system/components/link';
import { Logo } from '@repo/design-system/components/logo';
import { Prose } from '@repo/design-system/components/prose';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import Balancer from 'react-wrap-balancer';
import { SignupForm } from './components/form';
import ProductHunt from './product-hunt.svg';

const title = 'Sign up';
const description = 'Sign up to your account.';

export const metadata: Metadata = createMetadata({ title, description });

const Source = ({
  name,
  href,
}: {
  readonly name: string;
  readonly href: string;
}) => (
  <Link href={href} className="text-foreground">
    {name === 'producthunt' ? (
      <Image
        src={ProductHunt as StaticImageData}
        alt="Product Hunt"
        width={16}
        height={16}
        className="my-0 mr-1 inline h-4 w-4 rounded-full"
      />
    ) : null}
    {name === 'producthunt' ? 'Product Hunt' : name}
  </Link>
);

const SignUpPage = async () => {
  await handleAuthedState();

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full max-w-[400px] space-y-8">
        <Logo className="mx-auto h-12 w-12" />
        <SignupForm />
        <Prose>
          <p className="text-center text-muted-foreground text-sm">
            <Balancer>
              By signing in, you agree to our{' '}
              <Link href="https://www.eververse.ai/legal/terms">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="https://www.eververse.ai/legal/privacy">
                Privacy Policy
              </Link>
              .
            </Balancer>
          </p>
        </Prose>
      </div>
    </div>
  );
};

export default SignUpPage;
