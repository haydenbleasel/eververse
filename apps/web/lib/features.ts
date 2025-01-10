import {
  BlocksIcon,
  ClockIcon,
  CompassIcon,
  FlagIcon,
  GanttChartIcon,
  HeartPulseIcon,
  LinkIcon,
  MessageCircleIcon,
  TablePropertiesIcon,
  ZapIcon,
} from 'lucide-react';

export type Feature = {
  icon: typeof ClockIcon;
  name: string;
  href: string;
  description: string;
  formerly: string;
  short: string;
};

export const features: Record<string, Feature> = {
  initiatives: {
    icon: CompassIcon,
    name: 'Initiatives',
    href: '/initiatives',
    description: 'Build a source of truth for initiatives.',
    formerly: 'Run important projects across 7 tools.',
    short: 'Create and track initiatives.',
  },
  feedback: {
    icon: MessageCircleIcon,
    name: 'Feedback',
    href: '/feedback',
    description: 'Capture and triage feedback on autopilot.',
    formerly: 'Spend hours processing feedback manually.',
    short: 'Capture feedback on autopilot.',
  },
  features: {
    icon: TablePropertiesIcon,
    name: 'Features',
    href: '/features',
    description: 'Create a backlog that writes itself.',
    formerly: 'Spend hours writing a backlog.',
    short: 'Rich, visual backlogs.',
  },
  roadmap: {
    icon: GanttChartIcon,
    name: 'Roadmap',
    href: '/roadmap',
    description: 'Create a shared roadmap in minutes.',
    formerly: 'Spend weeks making a roadmap in spreadsheets.',
    short: 'Shared roadmaps in minutes.',
  },
  activity: {
    icon: HeartPulseIcon,
    name: 'Activity',
    href: '/activity',
    description: "See your team's activity in one place.",
    formerly: 'Spend hours on status updates and meetings.',
    short: 'Team activity in one place.',
  },
  changelog: {
    icon: ClockIcon,
    name: 'Changelog',
    href: '/changelog',
    description: 'Create and publish a rich changelog.',
    formerly: 'Send boring emails to users and stakeholders.',
    short: 'Publish engaging changelogs.',
  },
  portal: {
    icon: ZapIcon,
    name: 'Portal',
    href: '/portal',
    description: 'Create a public roadmap and changelog.',
    formerly: 'Send monthly email updates to your users.',
    short: 'Your public roadmap.',
  },
  widget: {
    icon: BlocksIcon,
    name: 'Widget',
    href: '/widget',
    description: 'Product-first updates in your app.',
    formerly: 'Send your users off-site for updates.',
    short: 'In-app, product-first updates.',
  },
  releases: {
    icon: FlagIcon,
    name: 'Releases',
    href: '/releases',
    description: 'Create, manage and sync releases from Jira.',
    formerly: 'Chase the Engineering team for release dates.',
    short: 'Create and track releases.',
  },
};

export const integrations: Feature = {
  icon: LinkIcon,
  name: 'Integrations',
  href: '/integrations',
  description: 'Sync apps and automate workflows.',
  formerly: 'Copy data between different tools.',
  short: 'Sync apps and automate workflows.',
};
