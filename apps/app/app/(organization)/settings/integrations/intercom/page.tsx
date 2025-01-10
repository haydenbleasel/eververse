import { database } from '@/lib/database';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Intercom Integration',
  description: 'Configure your Intercom integration settings.',
});

const IntercomSettings = async () => {
  const intercomInstallation = await database.intercomInstallation.findFirst({
    select: { id: true },
  });

  if (!intercomInstallation) {
    notFound();
  }

  const removeAction = async () => {
    'use server';

    const installation = await database.intercomInstallation.findFirst({
      where: { id: intercomInstallation.id },
      select: {
        accessToken: true,
        organization: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!installation) {
      throw new Error('Intercom installation not found');
    }

    const response = await fetch('https://api.intercom.io/auth/uninstall', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${installation.accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to uninstall Intercom integration');
    }

    await database.intercomInstallation.delete({
      where: { id: intercomInstallation.id },
      select: { id: true },
    });

    return redirect(`/${installation.organization.slug}/settings/integrations`);
  };

  return (
    <div>
      <h1 className="font-semibold text-2xl">Intercom Integration</h1>

      <StackCard title="Danger Zone" className="p-4">
        <form action={removeAction}>
          <Button type="submit" variant="destructive">
            Remove Intercom Integration
          </Button>
        </form>
      </StackCard>
    </div>
  );
};

export default IntercomSettings;
