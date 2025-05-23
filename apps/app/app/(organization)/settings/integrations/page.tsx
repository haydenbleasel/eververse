import { database } from '@/lib/database';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Image from 'next/image';

const title = 'Integrations';
const description = 'Connect your favorite tools to Eververse.';

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const IntegrationsSettings = async () => {
  const [
    jiraInstallation,
    gitHubInstallation,
    linearInstallation,
    slackInstallation,
    intercomInstallation,
    zapierFeedbackRequests,
    zapierFeatureRequests,
  ] = await Promise.all([
    database.atlassianInstallation.count(),
    database.gitHubInstallation.count(),
    database.linearInstallation.count(),
    database.slackInstallation.count(),
    database.intercomInstallation.count(),
    database.feedback.count({
      where: { source: 'ZAPIER' },
    }),
    database.feature.count({
      where: { source: 'ZAPIER' },
    }),
  ]);

  const integrations = [
    {
      title: 'Jira',
      description: 'Two-way sync your Jira issues with Eververse features.',
      icon: '/jira.svg',
      installed: Boolean(jiraInstallation),
      installLink: '/settings/integrations/jira',
      configureLink: '/settings/integrations/jira',
    },

    {
      title: 'GitHub',
      invert: true,
      description: 'Sync with GitHub issues',
      icon: '/github.svg',
      installed: Boolean(gitHubInstallation),
      installLink: '/api/integrations/github/start',
      configureLink: '/settings/integrations/github',
    },
    {
      title: 'Zapier',
      description: 'Automate workflows with Zapier',
      icon: '/zapier.svg',
      installed: Boolean(zapierFeedbackRequests || zapierFeatureRequests),
      installLink: 'https://zapier.com/apps/eververse/integrations',
      configureLink: 'https://zapier.com/app/zaps',
    },
    {
      title: 'Linear',
      description: 'Sync with Linear issues',
      icon: '/linear.svg',
      installed: Boolean(linearInstallation),
      installLink: '/settings/integrations/linear',
      configureLink: '/settings/integrations/linear',
    },
    {
      title: 'Slack',
      description: 'Send data from Slack to Eververse.',
      icon: '/slack.svg',
      installed: Boolean(slackInstallation),
      installLink: '/api/integrations/slack/start',
      configureLink: '/settings/integrations/slack',
    },
    {
      title: 'Intercom',
      description: 'Capture incoming feedback from Intercom.',
      icon: '/intercom.svg',
      installed: Boolean(intercomInstallation),
      installLink: '/settings/integrations/intercom',
      configureLink: '/settings/integrations/intercom',
    },
    {
      title: 'Eververse API',
      description: 'Interface directly with Eververse',
      icon: '/eververse.svg',
      installed: true,
      installLink: '/settings/api',
      configureLink: '/settings/api',
    },
    {
      title: 'Email',
      invert: true,
      description: 'Send feedback via email',
      icon: '/email.svg',
      installed: true,
      installLink: '/settings/integrations/email',
      configureLink: '/settings/integrations/email',
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="m-0 font-semibold text-4xl">{title}</h1>
        <p className="mb-0 text-muted-foreground">{description}</p>
      </div>

      <StackCard className="divide-y p-0">
        {integrations.map((integration) => (
          <div key={integration.title} className="flex items-center gap-4 p-4">
            <Image
              src={integration.icon}
              alt={integration.title}
              width={32}
              height={32}
              className="m-0 h-8 w-8 shrink-0 object-contain"
            />
            <div className="block flex-1">
              <div className="flex items-center gap-2">
                <div className="block font-medium">{integration.title}</div>
                {integration.installed && (
                  <Badge variant="outline">Installed</Badge>
                )}
              </div>
              <div className="block text-muted-foreground text-sm">
                {integration.description}
              </div>
            </div>
            {integration.installed ? (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <Link href={integration.configureLink}>Configure</Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <Link href={integration.installLink}>Install</Link>
              </Button>
            )}
          </div>
        ))}
      </StackCard>
    </div>
  );
};

export default IntegrationsSettings;
