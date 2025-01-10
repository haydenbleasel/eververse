'use client';

import * as Calendar from '@repo/design-system/components/roadmap-ui/calendar';
import { tailwind } from '@repo/tailwind-config';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';

const features: Calendar.CalendarItemProps['feature'][] = [
  {
    name: 'Optimize for mobile',
    startAt: subMonths(new Date(), 3),
    endAt: subDays(new Date(), 7),
    id: '1',
    status: {
      id: '1',
      name: '',
      color: tailwind.theme.colors.emerald[500],
    },
  },
  {
    name: 'Add dark mode',
    startAt: addDays(new Date(), 2),
    endAt: addMonths(new Date(), 3),
    id: '2',
    status: {
      id: '2',
      name: '',
      color: tailwind.theme.colors.gray[500],
    },
  },
  {
    name: 'Redesign checkout flow',
    startAt: subMonths(new Date(), 5),
    endAt: subMonths(new Date(), 2),
    id: '3',
    status: {
      id: '3',
      name: '',
      color: tailwind.theme.colors.emerald[500],
    },
  },
  {
    name: 'New pricing plans',
    startAt: subMonths(new Date(), 5),
    endAt: addMonths(new Date(), 6),
    id: '4',
    status: {
      id: '4',
      name: '',
      color: tailwind.theme.colors.yellow[500],
    },
  },
  {
    name: 'Beta Launch',
    startAt: subMonths(new Date(), 6),
    endAt: addMonths(new Date(), 6),
    id: '5',
    status: {
      id: '5',
      name: '',
      color: tailwind.theme.colors.emerald[500],
    },
  },
];

export const CalendarGraphic = () => (
  <div className="not-prose h-full w-full">
    <Calendar.CalendarProvider className="border-b bg-background">
      <Calendar.CalendarBody features={features}>
        {({ feature }) => (
          <Calendar.CalendarItem key={feature.id} feature={feature} />
        )}
      </Calendar.CalendarBody>
    </Calendar.CalendarProvider>
  </div>
);
