import {
  ActivityIcon,
  ChartAreaIcon,
  ClockIcon,
  CogIcon,
  CompassIcon,
  DatabaseIcon,
  FlagIcon,
  GanttChartIcon,
  HomeIcon,
  MessageCircleIcon,
  SparklesIcon,
  TablePropertiesIcon,
} from 'lucide-react';

export type SidebarPage = {
  readonly icon: typeof ActivityIcon;
  readonly label: string;
  readonly href: string;
  readonly active: (pathname: string) => boolean;
  readonly items?: Omit<SidebarPage, 'items' | 'icon'>[];
};

export const home: SidebarPage = {
  icon: HomeIcon,
  label: 'Home',
  href: '/',
  active: (pathname) => pathname === '/',
};

export const activity: SidebarPage = {
  icon: ActivityIcon,
  label: 'Activity',
  href: '/activity',
  active: (pathname) => pathname === '/activity',
};

export const insights: SidebarPage = {
  icon: ChartAreaIcon,
  label: 'Insights',
  href: '/insights',
  active: (pathname) => pathname === '/insights',
};

export const feedback: SidebarPage = {
  icon: MessageCircleIcon,
  label: 'Feedback',
  href: '/feedback',
  active: (pathname) => pathname.startsWith('/feedback'),
};

export const initiatives: SidebarPage = {
  icon: CompassIcon,
  label: 'Initiatives',
  href: '/initiatives',
  active: (pathname) => pathname.startsWith('/initiatives'),
};

export const features: SidebarPage = {
  icon: TablePropertiesIcon,
  label: 'Features',
  href: '/features',
  active: (pathname) => pathname.startsWith('/features'),
};

export const roadmap: SidebarPage = {
  icon: GanttChartIcon,
  label: 'Roadmap',
  href: '/roadmap',
  active: (pathname) => pathname.startsWith('/roadmap'),
  items: [
    {
      label: 'Gantt',
      href: '/roadmap',
      active: (pathname) => pathname === '/roadmap',
    },
    {
      label: 'Calendar',
      href: '/roadmap/calendar',
      active: (pathname) => pathname === '/roadmap/calendar',
    },
  ],
};

export const changelog: SidebarPage = {
  icon: ClockIcon,
  label: 'Changelog',
  href: '/changelog',
  active: (pathname) => pathname.startsWith('/changelog'),
};

export const releases: SidebarPage = {
  icon: FlagIcon,
  label: 'Releases',
  href: '/releases',
  active: (pathname) => pathname.startsWith('/releases'),
};

export const data: SidebarPage = {
  icon: DatabaseIcon,
  label: 'Data',
  href: '/data',
  active: (pathname) => pathname.startsWith('/data'),
  items: [
    {
      label: 'Users',
      href: '/data/users',
      active: (pathname) => pathname.startsWith('/data/users'),
    },
    {
      label: 'Companies',
      href: '/data/companies',
      active: (pathname) => pathname.startsWith('/data/companies'),
    },
  ],
};

export const settings: SidebarPage = {
  icon: CogIcon,
  label: 'Settings',
  href: '/settings',
  active: (pathname) => pathname.startsWith('/settings'),
};

export const welcome: SidebarPage = {
  icon: SparklesIcon,
  label: 'Welcome',
  href: '/welcome',
  active: (pathname) => pathname.startsWith('/welcome'),
};
