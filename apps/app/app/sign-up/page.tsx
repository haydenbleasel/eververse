import { handleAuthedState } from '@/lib/auth';
import { Link } from '@repo/design-system/components/link';
import { Logo } from '@repo/design-system/components/logo';
import { Prose } from '@repo/design-system/components/prose';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Balancer from 'react-wrap-balancer';
import { SignupForm } from './components/form';

const title = 'Sign up';
const description = 'Sign up to your account.';

export const metadata: Metadata = createMetadata({ title, description });

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
