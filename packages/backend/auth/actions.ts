'use server';

import { createClient } from './server';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const redirectUrl = new URL(
  '/',
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

export const slackLogin = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'slack',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }

  return data.url;
};

export const microsoftLogin = async () => {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }

  return data.url;
};
