"use client";

import { PlayCircleIcon } from "lucide-react";
import { domMax, LazyMotion, m } from "motion/react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import type { MouseEventHandler } from "react";
import { useState } from "react";
import HandGrabbingIcon from "@/public/handgrabbing.svg";
import VideoCall from "@/public/video.jpg";

export const MediaFeedbackGraphic = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <LazyMotion features={domMax}>
      {/* biome-ignore lint/nursery/noStaticElementInteractions: "animation" */}
      <div
        className="relative h-full w-full cursor-none"
        onMouseMove={handleMouseMove}
      >
        <m.div
          className="absolute"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            pointerEvents: "none",
          }}
        >
          <Image
            alt=""
            className="-top-2 -left-2 absolute z-10 h-8 w-8"
            height={32}
            src={HandGrabbingIcon as StaticImageData}
            width={32}
          />
          <div className="relative aspect-[192/107] w-48 rotate-3 overflow-hidden rounded-lg">
            <Image
              alt=""
              className="h-full w-full object-cover"
              height={107}
              src={VideoCall}
              width={192}
            />
            <PlayCircleIcon
              className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform text-white"
              size={20}
            />
          </div>
        </m.div>

        <div className="h-full w-full p-8">
          <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed bg-card p-8">
            <p className="text-muted-foreground text-sm">
              Click or drag-and-drop to upload feedback
            </p>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
};
