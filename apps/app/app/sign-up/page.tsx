import { handleAuthedState } from '@/lib/auth';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { SignupForm } from './components/form';

const title = 'Sign up';
const description = 'Sign up to your account.';

export const metadata: Metadata = createMetadata({ title, description });

const SignUpPage = async () => {
  await handleAuthedState();

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full max-w-[400px] space-y-8">
        <SignupForm />
        <p className="text-balance text-center text-muted-foreground text-sm">
          By signing in, you agree to our{' '}
          <a
            className="font-medium text-primary underline"
            href="https://www.eververse.ai/legal/terms"
            target="_blank"
            rel="noreferrer noopener"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            className="font-medium text-primary underline"
            href="https://www.eververse.ai/legal/privacy"
            target="_blank"
            rel="noreferrer noopener"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
