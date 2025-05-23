'use server';

import { createClient } from './server';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const redirectUrl = new URL(
  '/welcome',
  `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
).toString();

export const login = async (email: string) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }
};

export const signup = async (
  email: string,
  firstName: string | undefined,
  lastName: string | undefined
) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectUrl,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    throw error;
  }
};
