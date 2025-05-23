import { database } from '@/lib/database';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InstallLinear } from './components/install';
import { ManageLinear } from './components/manage';

export const metadata: Metadata = createMetadata({
  title: 'Linear Integration',
  description: 'Configure your Linear integration settings.',
});

const LinearIntegrationSettings = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return notFound();
  }

  const installation = await database.linearInstallation.findFirst({
    where: { organizationId },
  });

  if (!installation) {
    return <InstallLinear />;
  }

  return <ManageLinear id={installation.id} />;
};

export default LinearIntegrationSettings;
