'use client';

import { LazyMotion, domMax, useInView } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';

const activity: {
  name: string;
  description: string;
  time: string;
  image: string;
  left: string;
  top: string;
}[] = [
  {
    name: 'Chrissy',
    description: 'created a project',
    time: '3m',
    image: '/example-user-1.jpg',
    left: '60%',
    top: '-5%',
  },
  {
    name: 'John',
    description: 'updated the portal',
    time: '20m',
    image: '/example-user-2.jpg',
    left: '10%',
    top: '10%',
  },
  {
    name: 'Brian',
    description: 'tagged an insight',
    time: '1h',
    image: '/example-user-3.jpg',
    left: '50%',
    top: '20%',
  },
  {
    name: 'Grace',
    description: 'pushed a feature to Jira',
    time: '1h',
    image: '/example-user-4.jpg',
    left: '20%',
    top: '35%',
  },
  {
    name: 'Adam',
    description: 'updated the roadmap',
    time: '4h',
    image: '/example-user-5.jpg',
    left: '70%',
    top: '50%',
  },
  {
    name: 'James',
    description: 'created a feature',
    time: '6h',
    image: '/example-user-6.jpg',
    left: '-2%',
    top: '60%',
  },
  {
    name: 'Grace',
    description: 'created a feature',
    time: '8h',
    image: '/example-user-4.jpg',
    left: '50%',
    top: '70%',
  },
  {
    name: 'Chrissy',
    description: 'pushed a feature to Linear',
    time: '8h',
    image: '/example-user-1.jpg',
    left: '10%',
    top: '85%',
  },
  {
    name: 'John',
    description: 'updated the portal',
    time: '10h',
    image: '/example-user-2.jpg',
    left: '60%',
    top: '-5%',
  },
];

export const ActivityGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: 'all' });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domMax}>
      <div className="not-prose">
        {activity.map((item, index) => (
          <div
            key={index}
            className="absolute flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border bg-card p-3 pr-5 font-medium"
            style={{ left: item.left, top: item.top }}
          >
            <Image
              src={item.image}
              alt=""
              width={24}
              height={24}
              className="shrink-0 rounded-full"
            />
            <div className="flex items-center gap-2 truncate">
              <p className="text-sm">
                {item.name} {item.description}
              </p>
              <p className="text-muted-foreground text-sm">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </LazyMotion>
  );
};
