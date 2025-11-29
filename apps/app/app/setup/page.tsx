import { createClient } from "@repo/backend/auth/server";
import { currentOrganizationId } from "@repo/backend/auth/utils";
import { Button } from "@repo/design-system/components/ui/button";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrganizationForm } from "./components/form";

const title = "Create Organization";
const description = "Create an organization to get started.";

export const metadata: Metadata = createMetadata({ title, description });

const SetupPage = async () => {
  const organizationId = await currentOrganizationId();

  if (organizationId) {
    redirect("/");
  }

  const handleSignOut = async () => {
    "use server";

    const auth = await createClient();

    await auth.auth.signOut();
    redirect("/sign-in");
  };

  return (
    <div className="grid min-h-screen w-screen items-center justify-center px-4 py-16">
      <div className="fixed top-4 right-4">
        <form action={handleSignOut}>
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </div>
      <div className="w-full max-w-[400px] space-y-8">
        <CreateOrganizationForm />
        <p className="text-center text-muted-foreground text-sm">
          Is your organization already using Eververse? Ask your organization
          owner to invite you to join.
        </p>
      </div>
    </div>
  );
};

export default SetupPage;
