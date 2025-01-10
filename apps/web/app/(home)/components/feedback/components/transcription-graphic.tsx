'use client';

import VideoCall from '@/public/video.jpg';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { PlayCircleIcon } from 'lucide-react';
import { LazyMotion, domAnimation, m, useInView } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const transcriptionText =
  "Hmmm... if I had a magic wand, I would probably use it to change the checkout process. Right now it's a bit of a pain to use - I only needed to buy one thing, but I had to go through a bunch of steps to get it. I think it would be better if I could just click a button and have it delivered to my door.";

export const TranscriptionGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const inView = useInView(reference, { once: true, amount: 'all' });

  useEffect(() => {
    if (inView) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [inView]);

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative h-full w-full">
        <div className="absolute top-4 left-4 aspect-[542/303] w-1/2 overflow-hidden rounded-lg">
          <Image
            src={VideoCall}
            alt=""
            width={542}
            height={303}
            className="h-full w-full object-cover"
          />
          <PlayCircleIcon
            size={24}
            className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform text-white"
          />
        </div>
        <div className="absolute top-8 right-4 bottom-4 w-1/2 overflow-hidden rounded-lg border bg-background p-4 text-sm">
          <p className="mb-2 text-muted-foreground text-xs">Transcription</p>
          {loading ? (
            <span className="ml-1 inline-block translate-y-0.5">
              <LoadingCircle />
            </span>
          ) : null}
          {[...transcriptionText].map((char, index) => (
            <m.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: loading ? 0 : 1 }}
              transition={{
                delay: 1 + index * 0.01,
                duration: 0.01,
              }}
            >
              {char}
            </m.span>
          ))}
        </div>
      </div>
    </LazyMotion>
  );
};
