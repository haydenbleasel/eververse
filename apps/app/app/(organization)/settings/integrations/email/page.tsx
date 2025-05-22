import { currentOrganizationId } from '@repo/backend/auth/utils';
import { Input } from '@repo/design-system/components/precomposed/input';
import { StackCard } from '@repo/design-system/components/stack-card';
import { createMetadata } from '@repo/seo/metadata';
import { MailIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const title = 'Email Integration';
const description =
  'Send email to this address to create feedback in Eververse.';

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
    <div className="grid gap-6">
      <Image
        src="/email.svg"
        width={32}
        height={32}
        className="m-0 h-8 w-8"
        alt=""
      />
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl">{title}</h1>
        <p className="mb-0 text-muted-foreground">{description}</p>
      </div>

      <StackCard title="Inbound Email Address" icon={MailIcon} className="p-0">
        <Input
          name="email"
          type="email"
          readOnly
          value={`${organizationId}@inbound.eververse.ai`}
          className="h-auto rounded-none border-none p-3 shadow-none"
        />
      </StackCard>
    </div>
  );
};

export default EmailPage;
