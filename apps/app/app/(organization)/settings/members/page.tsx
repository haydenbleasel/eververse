import { currentMembers } from '@repo/backend/auth/utils';
import { Prose } from '@repo/design-system/components/prose';
import { StackCard } from '@repo/design-system/components/stack-card';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { InviteMemberButton } from './components/invite-member-button';
import { MembersTable } from './components/members-table';

const title = 'Members';
const description = "Manage your organization's members.";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Members = async () => {
  const members = await currentMembers();

  return (
    <div className="px-6 py-16">
      <Prose className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 font-semibold text-4xl">{title}</h1>
            <p className="mt-2 mb-0 text-muted-foreground">{description}</p>
          </div>
          <InviteMemberButton />
        </div>
        <StackCard title="Members" className="not-prose p-0">
          <MembersTable data={members} />
        </StackCard>
      </Prose>
    </div>
  );
};

export default Members;
