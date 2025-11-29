import type { User } from "@supabase/supabase-js";

export const getUserName = (user: User): string => {
  let name = user.id;
  const email = user.email;

  if (email) {
    name = email;
  }

  if (user.user_metadata.first_name) {
    name = user.user_metadata.first_name;

    if (user.user_metadata.last_name) {
      name = `${name} ${user.user_metadata.last_name}`;
    }
  }

  return name;
};
