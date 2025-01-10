'use client';

import HandGrabbingIcon from '@/public/handgrabbing.svg';
import VideoCall from '@/public/video.jpg';
import { PlayCircleIcon } from 'lucide-react';
import { LazyMotion, domMax, m } from 'motion/react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { useState } from 'react';
import type { MouseEventHandler } from 'react';

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
            pointerEvents: 'none',
          }}
        >
          <Image
            src={HandGrabbingIcon as StaticImageData}
            alt=""
            width={32}
            height={32}
            className="-top-2 -left-2 absolute z-10 h-8 w-8"
          />
          <div className="relative aspect-[192/107] w-48 rotate-3 overflow-hidden rounded-lg">
            <Image
              src={VideoCall}
              alt=""
              width={192}
              height={107}
              className="h-full w-full object-cover"
            />
            <PlayCircleIcon
              size={20}
              className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform text-white"
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
