import { database } from '@/lib/database';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Linear Integration',
  description: 'Configure your Linear integration settings.',
});

const LinearSettings = async () => {
  const linearInstallation = await database.linearInstallation.findFirst({
    select: { id: true },
  });

  if (!linearInstallation) {
    notFound();
  }

  const removeAction = async () => {
    'use server';

    const installation = await database.linearInstallation.delete({
      where: { id: linearInstallation.id },
      select: {
        organization: {
          select: {
            slug: true,
          },
        },
      },
    });

    return redirect(`/${installation.organization.slug}/settings/integrations`);
  };

  return (
    <div>
      <h1 className="font-semibold text-2xl">Linear Integration</h1>

      <StackCard title="Danger Zone" className="p-4">
        <form action={removeAction}>
          <Button type="submit" variant="destructive">
            Remove Linear Integration
          </Button>
        </form>
      </StackCard>
    </div>
  );
};

export default LinearSettings;
