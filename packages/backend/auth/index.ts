export type { User } from '@supabase/supabase-js';

// biome-ignore lint/nursery/noEnum: <explanation>
export enum EververseRole {
  Admin = 'admin',
  Editor = 'editor',
  Member = 'member',
}
