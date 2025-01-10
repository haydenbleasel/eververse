'use client';

import { cn } from '@repo/design-system/lib/utils';
import {
  LazyMotion,
  domMax,
  m,
  useDragControls,
  useInView,
} from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';

const slack = '/slack.svg';
const zapier = '/zapier.svg';
const email = '/email.svg';
const intercom = '/intercom.svg';

const tags = [
  {
    left: '60%',
    top: '-5%',
    image: intercom,
    text: 'Make the home screen customizable',
  },
  { left: '10%', top: '10%', image: slack, text: 'Add a dark mode' },
  { left: '50%', top: '20%', image: zapier, text: 'Improve search' },
  { left: '20%', top: '35%', image: email, text: 'Add a mobile app' },
  { left: '70%', top: '50%', image: intercom, text: 'Make it faster' },
  {
    left: '-2%',
    top: '60%',
    image: zapier,
    text: 'Add push notifications',
  },
  { left: '50%', top: '70%', image: slack, text: 'Enable offline mode' },
  {
    left: '10%',
    top: '85%',
    image: email,
    text: 'Personalize the experience',
  },
  { left: '60%', top: '80%', image: intercom, text: 'Quick actions?' },
  { left: '45%', top: '45%', image: zapier, text: 'iOS widget' },
  { left: '90%', top: '60%', image: slack, text: 'Android app' },
  { left: '-5%', top: '30%', image: email, text: 'Redesign the UI' },
  {
    left: '80%',
    top: '40%',
    image: intercom,
    text: 'Performance improvements',
  },
  {
    left: '35%',
    top: '85%',
    image: zapier,
    text: 'Improve accessibility',
  },
  { left: '70%', top: '20%', image: slack, text: 'More integrations' },
  { left: '40%', top: '10%', image: email, text: 'Tutorials' },
  { left: '90%', top: '0%', image: intercom, text: 'Better analytics' },
  { left: '25%', top: '60%', image: zapier, text: 'Custom themes' },
];

const Draggable = ({
  text,
  left,
  top,
  index,
  image,
}: (typeof tags)[0] & {
  readonly index: number;
}) => {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <m.div
      className={cn(
        'absolute flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border bg-card p-3 pr-5 font-medium',
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      style={{ left, top }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.25, bounce: 0.5, type: 'spring' }}
      drag
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      dragControls={controls}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Image src={image} alt="" width={24} height={24} className="shrink-0" />
      <p className="text-sm">{text}</p>
    </m.div>
  );
};

export const FeedbackIntegrationsGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: 'all' });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="not-prose flex flex-wrap gap-2">
      <LazyMotion features={domMax}>
        {tags.map((tag, index) => (
          <Draggable key={tag.text} index={index} {...tag} />
        ))}
      </LazyMotion>
    </div>
  );
};
