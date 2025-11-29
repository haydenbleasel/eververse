"use client";

import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { domAnimation, LazyMotion, m, useInView } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

const feedback = [
  "Hi there!",
  "I wanted to give some feedback on signing in to Eververse.",
  "I really like the new design, but I have a few suggestions for improvement.",
  "Its taking a long time to get everyone onboarded as we have to create accounts for everyone.",
  "We use Okta, so it would be great if we could use that to sign in.",
].join(" ");

const summary = "Candice wants Okta integration for SSO.";

export const SummarizeGraphic = () => {
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "some" });
  const [loaded, setLoaded] = useState(false);

  const handleAnimationEnd = (index: number) => {
    if (index !== feedback.length - 1) {
      return;
    }

    setTimeout(() => {
      setLoaded(true);
    }, 1000);
  };

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="not-prose flex h-full w-full flex-col justify-between gap-4 p-6">
        <div className="flex items-end gap-4">
          <Image
            alt=""
            className="h-6 w-6 shrink-0 rounded-full"
            height={24}
            src="/example-user-4.jpg"
            width={24}
          />
          <div className="rounded-lg border bg-card p-4">
            <p className="m-0 line-clamp-5 text-sm">
              {[...feedback].map((char, index) => (
                <m.span
                  animate={{ opacity: 1 }}
                  className="text-foreground text-sm"
                  initial={{ opacity: 0 }}
                  key={index}
                  onAnimationComplete={() => handleAnimationEnd(index)}
                  transition={{
                    delay: 1 + index * 0.01,
                    duration: 0.01,
                  }}
                >
                  {char}
                </m.span>
              ))}
            </p>
          </div>
        </div>
        {loaded ? (
          <p className="font-medium text-muted-foreground text-sm">
            🤖 {summary}
          </p>
        ) : (
          <LoadingCircle />
        )}
      </div>
    </LazyMotion>
  );
};
