import 'server-only';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { keys } from './keys';

const env = keys();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export const database = new PrismaClient();

/* Workaround for https://github.com/prisma/prisma/issues/11842 */
export const getJsonColumnFromTable = async (
  tableName: string,
  column: string,
  id: string
) => {
  const response = await supabase.from(tableName).select(column).eq('id', id);

  if (response.error) {
    throw response.error;
  }

  return response.data?.at(0)?.[column as keyof (typeof response.data)[0]] as
    | object
    | null;
};
