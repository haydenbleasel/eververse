import { createBrowserClient } from '@supabase/ssr';
import { keys } from '../keys';

const env = keys();

export const createClient = () =>
  createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
