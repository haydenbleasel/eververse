import type { EmailOtpType } from "@repo/backend/auth/server";
import { createClient } from "@repo/backend/auth/server";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (tokenHash) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type || "magiclink",
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(next);
    }
  }

  redirect("/error");
};
