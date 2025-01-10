'use client';

import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { LazyMotion, domMax, m, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const summaryText =
  'The team was busy yesterday! Grace primarily worked on Billing, creating a new feature "Add a payment method" and a new related tag "Checkout". Chrissy primarily worked on the Roadmap, adding new features related to the Dashboard and Home Screen. John primarily worked on the Feedback, leaving 5 comments across various feedback items.';

export const DigestGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: 'all' });
  const [visible, setVisible] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (inView) {
      setTimeout(() => {
        setVisible(true);
      }, 1000);
      setTimeout(() => {
        setRunning(true);
      }, 3000);
    }
  }, [inView]);

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domMax}>
      <m.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
      >
        {!running && <LoadingCircle />}
        {[...summaryText].map((char, index) => (
          <m.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: running ? 1 : 0 }}
            transition={{
              delay: index * 0.01,
              duration: 0.01,
            }}
            className="text-foreground text-sm"
          >
            {char}
          </m.span>
        ))}
      </m.div>
    </LazyMotion>
  );
};
