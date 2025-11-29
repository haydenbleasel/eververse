"use client";

import { cn } from "@repo/design-system/lib/utils";
import Image from "next/image";

const users = [
  { image: "/example-user-1.jpg", online: false },
  { image: "/example-user-2.jpg", online: true },
  { image: "/example-user-3.jpg", online: true },
  { image: "/example-user-4.jpg", online: false },
  { image: "/example-user-5.jpg", online: true },
  { image: "/example-user-6.jpg", online: false },
];

export const PresenceGraphic = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex items-center gap-2 border-background/5">
      {users.map((user, index) => (
        <div className="relative" key={index}>
          <Image
            alt=""
            className="m-0 rounded-full ring-4 ring-backdrop"
            height={32}
            src={user.image}
            width={32}
          />
          <div
            className={cn(
              "absolute right-0 bottom-0 h-2 w-2 rounded-full ring-[3px] ring-backdrop"
            )}
          >
            {user.online ? (
              <>
                <span className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-success" />
              </>
            ) : (
              <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-muted-foreground" />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
