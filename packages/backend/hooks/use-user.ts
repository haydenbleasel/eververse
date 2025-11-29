import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "../auth/client";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await createClient().auth.getSession();

      if (error) {
        console.error(error);
      }

      setUser(data.session?.user ?? null);
    };
    fetchUser();
  }, []);

  return user;
};
