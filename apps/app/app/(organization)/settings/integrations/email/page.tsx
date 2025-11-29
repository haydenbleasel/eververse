import { currentOrganizationId } from "@repo/backend/auth/utils";
import { Input } from "@repo/design-system/components/precomposed/input";
import { StackCard } from "@repo/design-system/components/stack-card";
import { createMetadata } from "@repo/seo/metadata";
import { MailIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

const title = "Email Integration";
const description =
  "Send email to this address to create feedback in Eververse.";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const EmailPage = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    notFound();
  }

  return (
    <>
      <Image
        alt=""
        className="m-0 h-8 w-8"
        height={32}
        src="/email.svg"
        width={32}
      />
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl tracking-tight">{title}</h1>
        <p className="mb-0 text-muted-foreground">{description}</p>
      </div>

      <StackCard className="p-0" icon={MailIcon} title="Inbound Email Address">
        <Input
          className="h-auto rounded-none border-none p-3 shadow-none"
          name="email"
          readOnly
          type="email"
          value={`${organizationId}@inbound.eververse.ai`}
        />
      </StackCard>
    </>
  );
};

export default EmailPage;
