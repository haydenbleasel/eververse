import { database } from '@/lib/database';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Slack Integration',
  description: 'Configure your Slack integration settings.',
});

const SlackSettings = async () => {
  const slackInstallation = await database.slackInstallation.findFirst({
    select: { id: true },
  });

  if (!slackInstallation) {
    notFound();
  }

  const removeAction = async () => {
    'use server';

    const installation = await database.slackInstallation.delete({
      where: { id: slackInstallation.id },
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
      <h1 className="font-semibold text-2xl">Slack Integration</h1>

      <StackCard title="Danger Zone" className="p-4">
        <form action={removeAction}>
          <Button type="submit" variant="destructive">
            Remove Slack Integration
          </Button>
        </form>
      </StackCard>
    </div>
  );
};

export default SlackSettings;
