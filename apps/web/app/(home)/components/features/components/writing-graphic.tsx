'use client';

import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { Prose } from '@repo/design-system/components/prose';
import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@repo/design-system/lib/utils';
import { SparklesIcon } from 'lucide-react';
import { LazyMotion, domAnimation, m, useInView } from 'motion/react';
import { useRef, useState } from 'react';

const initialText =
  'The purpose of this feature is to enhance the user onboarding experience by providing interactive walkthroughs. These walkthroughs will';

const continueText =
  'guide new users through the key functionalities of our product, using a combination of visual cues, step-by-step instructions and interactive elements. The feature aims to improve user engagement, reduce the learning curve, and increase the overall satisfaction and retention rates of new users.';

export const WritingGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const inView = useInView(reference, { once: true, amount: 'all' });

  const handleClick = () => {
    setLoading(true);
    setPlaying(true);
    setReady(false);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAnimationEnd = (index: number) => {
    if (index !== initialText.length - 1) {
      return;
    }

    setTimeout(() => {
      setReady(true);
    }, 500);
  };

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="h-full w-full">
        <Prose className="h-full w-full p-6">
          <p>
            {[...initialText].map((char, index) => (
              <m.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 1 + index * 0.02,
                  duration: 0.01,
                }}
                className="text-foreground"
                onAnimationComplete={() => handleAnimationEnd(index)}
              >
                {char}
              </m.span>
            ))}
            <span />{' '}
            <m.span
              className={cn('mt-2 block', (loading || playing) && 'absolute')}
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 1 : 0 }}
            >
              <Button onClick={handleClick} variant="outline" size="sm">
                <SparklesIcon size={12} /> Continue writing
              </Button>
            </m.span>
            {loading ? (
              <span className="ml-1 inline-block translate-y-0.5">
                <LoadingCircle />
              </span>
            ) : null}
            {[...continueText].map((char, index) => (
              <m.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: playing ? 1 : 0 }}
                transition={{
                  delay: 1 + index * 0.01,
                  duration: 0.01,
                }}
                className="text-violet-600 dark:text-violet-400"
              >
                {char}
              </m.span>
            ))}
          </p>
        </Prose>
      </div>
    </LazyMotion>
  );
};
