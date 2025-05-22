'use client';

import * as Gantt from '@repo/design-system/components/ui/kibo-ui/gantt';
import { colors } from '@repo/design-system/lib/colors';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';
import Image from 'next/image';

const data: (Gantt.GanttFeature & {
  owner: {
    id: string;
    name: string;
    image: string;
  };
})[] = [
  {
    name: 'Optimize for mobile',
    startAt: subMonths(new Date(), 3),
    endAt: subDays(new Date(), 7),
    id: '1',
    status: {
      id: '1',
      name: '',
      color: colors.emerald,
    },
    owner: {
      id: '1',
      name: '',
      image: '/example-user-1.jpg',
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
      color: colors.gray,
    },
    owner: {
      id: '1',
      name: '',
      image: '/example-user-2.jpg',
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
      color: colors.emerald,
    },
    owner: {
      id: '1',
      name: '',
      image: '/example-user-3.jpg',
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
      color: colors.yellow,
    },
    owner: {
      id: '1',
      name: '',
      image: '/example-user-4.jpg',
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
      color: colors.emerald,
    },
    owner: {
      id: '1',
      name: '',
      image: '/example-user-5.jpg',
    },
  },
  {
    name: 'Improve onboarding experience',
    startAt: subMonths(new Date(), 4),
    endAt: addMonths(new Date(), 1),
    id: '6',
    status: {
      id: '6',
      name: '',
      color: colors.blue,
    },
    owner: {
      id: '2',
      name: '',
      image: '/example-user-6.jpg',
    },
  },
  {
    name: 'Integrate with third-party API',
    startAt: subMonths(new Date(), 2),
    endAt: addMonths(new Date(), 2),
    id: '7',
    status: {
      id: '7',
      name: '',
      color: colors.red,
    },
    owner: {
      id: '3',
      name: '',
      image: '/example-user-1.jpg',
    },
  },
  {
    name: 'Enhance security features',
    startAt: subMonths(new Date(), 1),
    endAt: addMonths(new Date(), 3),
    id: '8',
    status: {
      id: '8',
      name: '',
      color: colors.purple,
    },
    owner: {
      id: '4',
      name: '',
      image: '/example-user-2.jpg',
    },
  },
  {
    name: 'Launch marketing campaign',
    startAt: subMonths(new Date(), 3),
    endAt: addMonths(new Date(), 4),
    id: '9',
    status: {
      id: '9',
      name: '',
      color: colors.orange,
    },
    owner: {
      id: '5',
      name: '',
      image: '/example-user-3.jpg',
    },
  },
  {
    name: 'Develop mobile app',
    startAt: subMonths(new Date(), 6),
    endAt: addMonths(new Date(), 5),
    id: '10',
    status: {
      id: '10',
      name: '',
      color: colors.teal,
    },
    owner: {
      id: '6',
      name: '',
      image: '/example-user-4.jpg',
    },
  },
];

const markers = [
  {
    id: 'beta',
    label: 'Beta Launch',
    date: new Date(),
    className: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'launch',
    label: 'Launch',
    date: addMonths(new Date(), 1),
    className: 'bg-cyan-100 text-cyan-700',
  },
  {
    id: 'review',
    label: 'Review',
    date: subMonths(new Date(), 3),
    className: 'bg-teal-100 text-teal-700',
  },
];

export const RoadmapGraphic = () => (
  <div className="not-prose h-full w-full overflow-hidden">
    <Gantt.GanttProvider range="quarterly" zoom={100}>
      <Gantt.GanttTimeline>
        <Gantt.GanttHeader />
        <Gantt.GanttFeatureList>
          <Gantt.GanttFeatureListGroup>
            {data.map((feature) => (
              <Gantt.GanttFeatureItem key={feature.id} {...feature}>
                <div className="flex w-full items-center gap-2 overflow-hidden">
                  <p className="flex-1 truncate text-xs">{feature.name}</p>
                  <Image
                    src={feature.owner.image}
                    alt={feature.owner.name}
                    width={20}
                    height={20}
                    className="overflow-hidden rounded-full"
                  />
                </div>
              </Gantt.GanttFeatureItem>
            ))}
          </Gantt.GanttFeatureListGroup>
        </Gantt.GanttFeatureList>
        {markers.map((marker) => (
          <Gantt.GanttMarker
            key={marker.id}
            id={marker.id}
            date={marker.date}
            label={marker.label}
            className={marker.className}
          />
        ))}
      </Gantt.GanttTimeline>
    </Gantt.GanttProvider>
  </div>
);
