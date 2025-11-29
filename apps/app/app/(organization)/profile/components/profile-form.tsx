"use client";

import { createClient } from "@repo/backend/auth/client";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useState } from "react";
import { toast } from "sonner";

type ProfileFormProps = {
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
};

export const ProfileForm = ({
  defaultFirstName,
  defaultLastName,
  defaultEmail,
}: ProfileFormProps) => {
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const disabled =
    loading ||
    (firstName === defaultFirstName &&
      lastName === defaultLastName &&
      email === defaultEmail);

  const updateProfile = async () => {
    try {
      const supabase = createClient();
      const data: Record<string, string> = {};

      if (disabled) {
        return;
      }

      setLoading(true);

      if (firstName !== defaultFirstName) {
        data.first_name = firstName;
      }

      if (lastName !== defaultLastName) {
        data.last_name = lastName;
      }

      if (email !== defaultEmail) {
        data.email = email;
      }

      const { error } = await supabase.auth.updateUser({
        data,
      });

      if (error) {
        throw error;
      }

      toast.success("Profile updated");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={updateProfile}>
      <Input
        label="First Name"
        name="first-name"
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
        value={firstName}
      />
      <Input
        label="Last Name"
        name="last-name"
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
        value={lastName}
      />
      <Input
        label="Email"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        value={email}
      />
      <Button disabled={disabled} type="submit">
        Update
      </Button>
    </form>
  );
};
