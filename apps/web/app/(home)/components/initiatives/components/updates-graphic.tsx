"use client";

import { MailIcon } from "lucide-react";
import { domMax, LazyMotion, m } from "motion/react";
import Image from "next/image";

const users = [
  { image: "/example-user-1.jpg", initialRotation: 0 },
  { image: "/example-user-2.jpg", initialRotation: 60 },
  { image: "/example-user-3.jpg", initialRotation: 120 },
  { image: "/example-user-4.jpg", initialRotation: 180 },
  { image: "/example-user-5.jpg", initialRotation: 240 },
];

export const UpdatesGraphic = () => {
  return (
    <LazyMotion features={domMax}>
      <div className="flex h-full items-center justify-center">
        <div className="relative">
          <div className="-inset-12 absolute rounded-full border-2 border-muted-foreground/25" />
          <div className="-inset-24 absolute rounded-full border-2 border-muted-foreground/20" />
          <div className="-inset-36 absolute rounded-full border-2 border-muted-foreground/15" />
          <div className="-inset-48 absolute rounded-full border-2 border-muted-foreground/10" />
          <div className="-inset-60 absolute rounded-full border-2 border-muted-foreground/5" />

          {users.map((user, index) => (
            <m.div
              animate={{
                rotate: [user.initialRotation, user.initialRotation + 360],
              }}
              className="absolute"
              key={index}
              style={{
                width: 32,
                height: 32,
                left: "50%",
                top: "50%",
                marginLeft: -16,
                marginTop: -16,
              }}
              transition={{
                duration: 15 + index * 3, // Reduced from 20 + circle * 4
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <m.div
                style={{
                  transform: `translateX(${(index + 1) * 48 + 24}px) rotate(-${user.initialRotation}deg)`,
                }}
              >
                <Image
                  alt=""
                  className="rounded-full ring-2 ring-backdrop"
                  height={32}
                  src={user.image}
                  width={32}
                />
              </m.div>
            </m.div>
          ))}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border bg-background shadow-sm">
            <MailIcon className="text-muted-foreground" size={24} />
          </div>
        </div>
      </div>
    </LazyMotion>
  );
};
