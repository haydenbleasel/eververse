import { database } from '@/lib/database';
import { emptyStates } from '@/lib/empty-states';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { Link } from '@repo/design-system/components/link';
import { Prose } from '@repo/design-system/components/prose';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { Video } from '@repo/design-system/components/video';
import { cn } from '@repo/design-system/lib/utils';
import { createMetadata } from '@repo/seo/metadata';
import { CheckCircleIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddFeatureButton } from './components/add-feature-button';
import { AddFeedbackButton } from './components/add-feedback-button';
import { OnboardingOptions } from './components/onboarding-options';

export const metadata: Metadata = createMetadata({
  title: 'Welcome',
  description: 'Welcome to Eververse!',
});

const Welcome = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    notFound();
  }

  const [
    organization,
    feedbackCount,
    feedbackApiCount,
    featureCount,
    keysCount,
    roadmapFeatureCount,
    zapierFeedbackCount,
    changelogCount,
    portalCount,
    portalFeatureCount,
    triageCount,
    releasesCount,
    widgetCount,
    widgetItemCount,
  ] = await Promise.all([
    database.organization.findUnique({
      where: { id: organizationId },
    }),
    database.feedback.count({
      where: { organizationId },
    }),
    database.feedback.count({
      where: {
        organizationId,
        source: 'API',
      },
    }),
    database.feature.count({
      where: { organizationId },
    }),
    database.apiKey.count({
      where: { organizationId },
    }),
    database.feature.count({
      where: {
        organizationId,
        startAt: { not: null },
        endAt: { not: null },
      },
    }),
    database.feedback.count({
      where: {
        organizationId,
        source: 'ZAPIER',
      },
    }),
    database.changelog.count({
      where: { organizationId },
    }),
    database.portal.count({
      where: { organizationId },
    }),
    database.portalFeature.count({
      where: { organizationId },
    }),
    database.feedbackFeatureLink.count({
      where: { organizationId },
    }),
    database.release.count({
      where: { organizationId },
    }),
    database.widget.count({
      where: { organizationId },
    }),
    database.widgetItem.count({
      where: { organizationId },
    }),
  ]);

  if (!organization) {
    notFound();
  }

  const startStep = {
    title: 'Start adding your own content',
    description: 'How would you like to get started?',
    complete: organization.onboardedAt,
    children: <OnboardingOptions type={organization.onboardingType} />,
    disabled: user.user_metadata.organization_role !== EververseRole.Admin,
  };

  const portalStep = {
    title: 'Create a portal',
    description:
      'Create a portal to share your changelog and roadmap with your users and customers.',
    complete: portalCount > 0,
    children: (
      <Button asChild>
        <Link href="/portal">Create a portal</Link>
      </Button>
    ),
    disabled: user.user_metadata.organization_role !== EververseRole.Admin,
  };

  const featurePortalStep = {
    title: 'Add a feature to your portal',
    description:
      'Add a feature to your portal to collect feedback from your users and customers.',
    complete: portalFeatureCount > 0,
    children: (
      <Button asChild>
        <Link href="/features">Add a feature to your portal</Link>
      </Button>
    ),
    disabled:
      user.user_metadata.organization_role === EververseRole.Member ||
      featureCount === 0,
  };

  const feedbackStep = {
    title: emptyStates.feedback.title,
    description: emptyStates.feedback.description,
    complete: feedbackCount > 0,
    children: <AddFeedbackButton />,
    disabled: false,
  };

  const featureStep = {
    title: emptyStates.feature.title,
    description: emptyStates.feature.description,
    complete: featureCount > 0,
    children: <AddFeatureButton />,
    disabled: user.user_metadata.organization_role === EververseRole.Member,
  };

  const featureRoadmapStep = {
    title: 'Add a feature to your roadmap',
    description:
      'Assigning a start and end date to a feature will automatically add it to your roadmap.',
    complete: roadmapFeatureCount > 0,
    children: (
      <Button asChild>
        <Link href="/features">Update your roadmap</Link>
      </Button>
    ),
    disabled: user.user_metadata.organization_role === EververseRole.Member,
  };

  const triageStep = {
    title: 'Triage your feedback',
    description:
      'Highlight some text in a piece of feedback to triage it, connecting it to a feature.',
    complete: triageCount > 0,
    children: (
      <Button asChild>
        <Link href="/feedback">Triage your feedback</Link>
      </Button>
    ),
    disabled:
      user.user_metadata.organization_role === EververseRole.Member ||
      !feedbackCount,
  };

  const apiKeyStep = {
    title: 'Generate an API key',
    description:
      'You can use the Eververse API to send feedback from your app or website directly into Eververse.',
    complete: keysCount > 0,
    children: (
      <Button asChild>
        <Link href="/settings/api">Generate an API key</Link>
      </Button>
    ),
    disabled: user.user_metadata.organization_role !== EververseRole.Admin,
  };

  const integrationStep = {
    title: 'Send user feedback into Eververse',
    description:
      'You can send feedback from your app or website directly into Eververse using Zapier or the Eververse API.',
    complete: feedbackApiCount > 0 || zapierFeedbackCount > 0,
    children: (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button asChild>
          <a
            href="https://zapier.com/apps/eververse/integrations"
            target="_blank"
            rel="noreferrer noopener"
          >
            Connect with Zapier
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a
            href="https://docs.eververse.ai/api-reference/introduction"
            target="_blank"
            rel="noreferrer noopener"
          >
            Read the API documentation
          </a>
        </Button>
      </div>
    ),
    disabled: user.user_metadata.organization_role !== EververseRole.Admin,
  };

  const changelogStep = {
    title: 'Publish a changlog',
    description:
      'You can publish a changelog to keep your users informed about new features and bug fixes.',
    complete: changelogCount > 0,
    children: (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button asChild>
          <Link href="/changelog">Create a changelog</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/settings/import/markdown">Import from Markdown</Link>
        </Button>
      </div>
    ),
    disabled: user.user_metadata.organization_role === EververseRole.Member,
  };

  const widgetStep = {
    title: 'Create a widget',
    description: 'Create a widget to embed in your website.',
    complete: widgetCount > 0,
    children: (
      <Button asChild>
        <Link href="/widget">Create a widget</Link>
      </Button>
    ),
    disabled: user.user_metadata.organization_role !== EververseRole.Admin,
  };

  const widgetItemStep = {
    title: 'Add custom links to your widget',
    description:
      'Link out to a Slack channel, documentation or other resources.',
    complete: widgetItemCount > 0,
    children: (
      <Button asChild>
        <Link href="/widget">Add custom links</Link>
      </Button>
    ),
    disabled: user.user_metadata.organization_role !== EververseRole.Admin,
  };

  const releaseStep = {
    title: 'Create a release',
    description:
      'Create a release to communicate with your team about changes.',
    complete: releasesCount > 0,
    children: (
      <Button asChild>
        <Link href="/releases">Create a release</Link>
      </Button>
    ),
    disabled: user.user_metadata.organization_role === EververseRole.Member,
  };

  const steps = [startStep, portalStep, featurePortalStep];

  if (organization.onboardedAt) {
    steps.push(
      feedbackStep,
      featureStep,
      featureRoadmapStep,
      triageStep,
      apiKeyStep,
      integrationStep,
      changelogStep,
      widgetStep,
      widgetItemStep,
      releaseStep
    );
  }

  const availableSteps = steps.filter((step) => !step.disabled);
  const progress = Math.round(
    (availableSteps.filter((step) => step.complete).length /
      availableSteps.length) *
      100
  );

  return (
    <div className="w-full px-6 py-16">
      <Prose className="mx-auto grid w-full gap-6">
        <div className="flex flex-col-reverse items-start justify-between gap-8 sm:flex-row">
          <div>
            <h1 className="mb-0">Welcome</h1>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Welcome to Eververse! Let&apos;s get you set up so you can start
              collecting feedback, creating features and building your roadmap.
            </p>
          </div>
          <div className="relative aspect-square w-20">
            <div className="absolute inset-0">
              <div
                className="radial-progress shrink-0 text-border"
                /* @ts-expect-error "CSS variable" */
                style={{ '--value': 100 }}
              />
            </div>
            <div className="absolute inset-0">
              <div
                className={cn(
                  'radial-progress shrink-0',
                  progress === 100 ? 'text-success' : 'text-primary'
                )}
                /* @ts-expect-error "CSS variable" */
                style={{ '--value': progress }}
              >
                {progress}%
              </div>
            </div>
          </div>
        </div>

        <div className="not-prose flex flex-col space-y-4">
          <StackCard title="Introduction video" className="p-0">
            <Video
              url="https://youtu.be/IuEwJD9fgKM"
              className="aspect-[861/540] overflow-hidden rounded-none"
              controls
            />
          </StackCard>

          {steps
            .filter((step) => !step.disabled)
            .map((step) => (
              <div key={step.title}>
                <StackCard title={step.title} className="p-4">
                  <div className="flex flex-col-reverse items-start gap-8 sm:flex-row">
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </div>
                    {step.complete ? (
                      <CheckCircleIcon
                        size={20}
                        className="shrink-0 text-success"
                      />
                    ) : (
                      <div className="hidden shrink-0 sm:block" />
                    )}
                  </div>
                  {!step.complete && (
                    <div className="mt-4">{step.children}</div>
                  )}
                </StackCard>
              </div>
            ))}
        </div>
      </Prose>
    </div>
  );
};

export default Welcome;
