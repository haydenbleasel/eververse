"use client";

import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { EqualIcon } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const RiceGraphic = () => {
  const [reach, setReach] = useState(0);
  const [impact, setImpact] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [effort, setEffort] = useState(0);
  const loaded = useRef<boolean>(false);
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "all" });

  useEffect(() => {
    if (loaded.current || !inView) {
      return;
    }

    const reachTimeout = Math.floor(Math.random() * 2000) + 1000;
    const impactTimeout = Math.floor(Math.random() * 2000) + 1000;
    const confidenceTimeout = Math.floor(Math.random() * 2000) + 1000;
    const effortTimeout = Math.floor(Math.random() * 2000) + 1000;

    const reachValue = Math.floor(Math.random() * 10) + 1;
    const impactValue = Math.floor(Math.random() * 10) + 1;
    const confidenceValue = Math.floor(Math.random() * 10) + 1;
    const effortValue = Math.floor(Math.random() * 10) + 1;

    setTimeout(() => setReach(reachValue), reachTimeout);
    setTimeout(() => setImpact(impactValue), impactTimeout);
    setTimeout(() => setConfidence(confidenceValue), confidenceTimeout);
    setTimeout(() => setEffort(effortValue), effortTimeout);

    loaded.current = true;
  }, [inView]);

  if (!inView) {
    return <div ref={reference} />;
  }

  return (
    <div className="not-prose flex h-full w-full items-center justify-center gap-2 p-6">
      <div className="-space-x-px flex items-center rounded bg-background shadow-sm">
        <div className="flex aspect-square w-16 items-center justify-center rounded-l border text-violet-400">
          {reach ? (
            <p className="font-medium font-mono text-lg">{reach}</p>
          ) : (
            <LoadingCircle />
          )}
        </div>
        <div className="flex aspect-square w-16 items-center justify-center border text-violet-400">
          {impact ? (
            <p className="font-medium font-mono text-lg">{impact}</p>
          ) : (
            <LoadingCircle />
          )}
        </div>
        <div className="flex aspect-square w-16 items-center justify-center border text-violet-400">
          {confidence ? (
            <p className="font-medium font-mono text-lg">{confidence}</p>
          ) : (
            <LoadingCircle />
          )}
        </div>
        <div className="flex aspect-square w-16 items-center justify-center rounded-r border text-violet-400">
          {effort ? (
            <p className="font-medium font-mono text-lg">{effort}</p>
          ) : (
            <LoadingCircle />
          )}
        </div>
      </div>
      <div>
        <EqualIcon className="text-muted-foreground" size={24} />
      </div>
      <div>
        {reach && impact && confidence && effort ? (
          <p className="font-medium font-mono text-lg">
            {Math.floor((confidence * reach * impact) / effort)}
          </p>
        ) : (
          <LoadingCircle />
        )}
      </div>
    </div>
  );
};
