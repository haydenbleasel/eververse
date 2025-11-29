"use client";

import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { domMax, LazyMotion, m, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

const summaryText =
  'The team was busy yesterday! Grace primarily worked on Billing, creating a new feature "Add a payment method" and a new related tag "Checkout". Chrissy primarily worked on the Roadmap, adding new features related to the Dashboard and Home Screen. John primarily worked on the Feedback, leaving 5 comments across various feedback items.';

export const DigestGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "all" });
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
        animate={{ opacity: visible ? 1 : 0 }}
        className="p-6"
        initial={{ opacity: 0 }}
      >
        {!running && <LoadingCircle />}
        {[...summaryText].map((char, index) => (
          <m.span
            animate={{ opacity: running ? 1 : 0 }}
            className="text-foreground text-sm"
            initial={{ opacity: 0 }}
            key={index}
            transition={{
              delay: index * 0.01,
              duration: 0.01,
            }}
          >
            {char}
          </m.span>
        ))}
      </m.div>
    </LazyMotion>
  );
};
