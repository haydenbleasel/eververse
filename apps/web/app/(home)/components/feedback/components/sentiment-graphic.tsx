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
import { useEffect, useRef, useState } from 'react';

import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { SentimentEmoji } from '@repo/design-system/components/sentiment-emoji';
import type { ComponentProps, FC } from 'react';

const feedback: {
  title: string;
  description: string;
  sentiment: ComponentProps<typeof SentimentEmoji>['value'];
  left: string;
  top: string;
  image: string;
}[] = [
  {
    title: "Can't figure out how to upgrade plan",
    description:
      'I would like to subscribe to the premium plan, but I can’t find the button to do so.',
    sentiment: 'CONFUSED',
    left: '5%',
    top: '-8%',
    image: '/example-user-1.jpg',
  },
  {
    title: 'Pricing is stupidly expensive',
    description:
      'The Premium plan is way too expensive. I would be willing to pay $10/month, but not $20/month.',
    sentiment: 'ANGRY',
    left: '20%',
    top: '32%',
    image: '/example-user-2.jpg',
  },
  {
    title: 'Lack of Apple Pay is a dealbreaker',
    description:
      'We can’t use this because it doesn’t support Apple Pay. We need to be able to accept payments from our customers.',
    sentiment: 'NEGATIVE',
    left: '35%',
    top: '15%',
    image: '/example-user-3.jpg',
  },
  {
    title: 'Not sure how to subscribe',
    description:
      'I would like to subscribe to the premium plan, but I can’t find the button to do so.',
    sentiment: 'CONFUSED',
    left: '3%',
    top: '53%',
    image: '/example-user-4.jpg',
  },
  {
    title: 'Really hate the new billing system',
    description:
      'The new billing system is really confusing. I can’t figure out how to cancel my subscription. Also, I was charged twice last month.',
    sentiment: 'NEGATIVE',
    left: '50%',
    top: '65%',
    image: '/example-user-5.jpg',
  },
  {
    title: "Why don't you support coupon codes?",
    description:
      "Seriously it's not that hard to implement. I would like to be able to offer discounts to my customers.",
    sentiment: 'ANGRY',
    left: '10%',
    top: '85%',
    image: '/example-user-6.jpg',
  },
];

const DraggableFeedback: FC<(typeof feedback)[0]> = ({
  title,
  description,
  sentiment,
  left,
  top,
  image,
}) => {
  const controls = useDragControls();
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setTimeout(
      () => {
        setReady(true);
      },
      1000 + Math.random() * 2000
    );
  }, []);

  return (
    <m.div
      className={cn(
        'absolute flex w-[60%] shrink-0 items-center gap-3 rounded-full border bg-card p-3',
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      initial={{ scale: 0.5 }}
      animate={{ scale: 1 }}
      style={{ left, top }}
      transition={{ bounce: 0.5, type: 'spring' }}
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
      <div className="relative shrink-0">
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="-bottom-1 -right-1 absolute text-sm">
          {ready ? <SentimentEmoji value={sentiment} /> : <LoadingCircle />}
        </div>
      </div>
      <div className="grid">
        <p className="truncate font-medium text-foreground text-sm">{title}</p>
        <p className="truncate text-muted-foreground text-xs">{description}</p>
      </div>
    </m.div>
  );
};

export const SentimentGraphic: FC = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: 'all' });

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="not-prose h-full w-full">
      <LazyMotion features={domMax}>
        {feedback.map((item, index) => (
          <DraggableFeedback {...item} key={index} />
        ))}
      </LazyMotion>
    </div>
  );
};
