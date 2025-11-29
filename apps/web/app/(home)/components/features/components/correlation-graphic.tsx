"use client";

import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { Prose } from "@repo/design-system/components/prose";
import { domAnimation, LazyMotion, m, useInView } from "motion/react";
import Image from "next/image";
import type { FC } from "react";
import { useRef, useState } from "react";

const feedback: {
  title: string;
  description: string;
  image: string;
}[] = [
  {
    title: "Where is the coupon code field? I can't find it.",
    description:
      "I have a coupon code for 20% off, but I can’t find where to enter it. Can you help?",
    image: "/example-user-4.jpg",
  },
  {
    title: "Support for adding business details",
    description:
      "I am a business owner and I need to be able to add my business details to the checkout process. Can you help?",
    image: "/example-user-5.jpg",
  },
  {
    title: "Lack of Apple Pay is a dealbreaker",
    description:
      "We can’t use this because it doesn’t support Apple Pay. We need to be able to accept payments from our customers.",
    image: "/example-user-6.jpg",
  },
];

const Feedback: FC<(typeof feedback)[0]> = ({ title, description, image }) => (
  <div className="flex w-[90%] shrink-0 items-center gap-3 rounded-full border bg-card p-3 sm:w-[45%]">
    <Image
      alt=""
      className="relative shrink-0 rounded-full"
      height={32}
      src={image}
      width={32}
    />
    <div className="grid">
      <p className="truncate font-medium text-foreground text-sm">{title}</p>
      <p className="truncate text-muted-foreground text-xs">{description}</p>
    </div>
  </div>
);

const initialText =
  "As part of this project, we are aiming to build a new checkout process that is more intuitive and easier to use.";

export const CorrelationGraphic: FC = () => {
  const reference = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inView = useInView(reference, { once: true, amount: "all" });

  const handleAnimationEnd = (index: number) => {
    if (index !== initialText.length - 1) {
      return;
    }

    setTimeout(() => {
      setLoading(true);
    }, 500);

    setTimeout(() => {
      setLoading(false);
      setLoaded(true);
    }, 1500);
  };

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="h-full w-full">
        <Prose className="flex h-full w-full flex-col gap-3 p-6">
          <p className="m-0 flex-1 text-sm sm:text-base">
            {[...initialText].map((char, index) => (
              <m.span
                animate={{ opacity: 1 }}
                className="text-foreground"
                initial={{ opacity: 0 }}
                key={index}
                onAnimationComplete={() => handleAnimationEnd(index)}
                transition={{
                  delay: 1 + index * 0.02,
                  duration: 0.01,
                }}
              >
                {char}
              </m.span>
            ))}
            <span />{" "}
            {loading ? (
              <span className="ml-1 inline-block translate-y-0.5">
                <LoadingCircle />
              </span>
            ) : null}
          </p>
          <m.div
            animate={{ opacity: loaded ? 1 : 0 }}
            className="shrink-0"
            initial={{ opacity: 0 }}
          >
            <p className="font-medium text-sm text-violet-400">
              🤖 Here are some insights related to a new checkout process:
            </p>
            <div className="not-prose mt-2 flex flex-nowrap items-center gap-3">
              {feedback.map((item, index) => (
                <Feedback key={index} {...item} />
              ))}
            </div>
          </m.div>
        </Prose>
      </div>
    </LazyMotion>
  );
};
