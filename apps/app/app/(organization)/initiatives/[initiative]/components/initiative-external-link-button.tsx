'use client';
import { GlobeIcon } from 'lucide-react';
import Image from 'next/image';

import type { InitiativeExternalLink } from '@repo/backend/prisma/client';
import { externalLinkProperties } from './create-initiative-link-button';

type InitiativeExternalLinkButtonProperties = Pick<
  InitiativeExternalLink,
  'href' | 'title'
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
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-1.5 font-medium text-xs"
    >
      {icon ? (
        <Image
          src={icon}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 shrink-0 object-contain"
        />
      ) : (
        <GlobeIcon size={16} className="shrink-0 text-muted-foreground" />
      )}
      <span className="w-full truncate group-hover:underline">{title}</span>
    </a>
  );
};
