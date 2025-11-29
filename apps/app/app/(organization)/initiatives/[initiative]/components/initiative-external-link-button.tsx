"use client";

import type { InitiativeExternalLink } from "@repo/backend/prisma/client";
import { GlobeIcon } from "lucide-react";
import Image from "next/image";
import { externalLinkProperties } from "./create-initiative-link-button";

type InitiativeExternalLinkButtonProperties = Pick<
  InitiativeExternalLink,
  "href" | "title"
>;

export const InitiativeExternalLinkButton = ({
  title,
  href,
}: InitiativeExternalLinkButtonProperties) => {
  const icon = externalLinkProperties.find((property) =>
    property.regex.test(href)
  )?.icon;

  return (
    <a
      className="group flex items-center gap-1.5 font-medium text-xs"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {icon ? (
        <Image
          alt=""
          className="h-4 w-4 shrink-0 object-contain"
          height={16}
          src={icon}
          width={16}
        />
      ) : (
        <GlobeIcon className="shrink-0 text-muted-foreground" size={16} />
      )}
      <span className="w-full truncate group-hover:underline">{title}</span>
    </a>
  );
};
