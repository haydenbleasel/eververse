'use client';

import { createInitiativeLink } from '@/actions/initiative-link/create';
import DropboxIcon from '@/public/dropbox.svg';
import EververseIcon from '@/public/eververse.svg';
import FigmaIcon from '@/public/figma.svg';
import GitHubIcon from '@/public/github.svg';
import GitLabIcon from '@/public/gitlab.svg';
import GoogleDriveIcon from '@/public/google-drive.svg';
import IntercomIcon from '@/public/intercom.svg';
import JiraIcon from '@/public/jira.svg';
import LinearIcon from '@/public/linear.svg';
import MiroIcon from '@/public/miro.svg';
import NotionIcon from '@/public/notion.svg';
import PitchIcon from '@/public/pitch.svg';
import SlackIcon from '@/public/slack.svg';
import WhimsicalIcon from '@/public/whimsical.svg';
import ZoomIcon from '@/public/zoom.svg';
import type { Initiative } from '@repo/backend/prisma/client';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { GlobeIcon, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { useState } from 'react';

type CreateInitiativeLinkButtonProperties = {
  readonly initiativeId: Initiative['id'];
};

export const externalLinkProperties: {
  value: string;
  regex: RegExp;
  icon: StaticImageData;
}[] = [
  {
    value: 'eververse',
    regex: /eververse.ai/u,
    icon: EververseIcon as StaticImageData,
  },
  {
    value: 'dropbox',
    regex: /dropbox.com/u,
    icon: DropboxIcon as StaticImageData,
  },
  {
    value: 'figma',
    regex: /figma.com/u,
    icon: FigmaIcon as StaticImageData,
  },
  {
    value: 'github',
    regex: /github.com/u,
    icon: GitHubIcon as StaticImageData,
  },
  {
    value: 'gitlab',
    regex: /gitlab.com/u,
    icon: GitLabIcon as StaticImageData,
  },
  {
    value: 'google_drive',
    regex: /drive.google.com/u,
    icon: GoogleDriveIcon as StaticImageData,
  },
  {
    value: 'intercom',
    regex: /intercom.com/u,
    icon: IntercomIcon as StaticImageData,
  },
  {
    value: 'linear',
    regex: /linear.app/u,
    icon: LinearIcon as StaticImageData,
  },
  {
    value: 'jira',
    regex: /atlassian.net/u,
    icon: JiraIcon as StaticImageData,
  },
  {
    value: 'notion',
    regex: /notion.so/u,
    icon: NotionIcon as StaticImageData,
  },
  {
    value: 'slack',
    regex: /slack.com/u,
    icon: SlackIcon as StaticImageData,
  },
  {
    value: 'miro',
    regex: /miro.com/u,
    icon: MiroIcon as StaticImageData,
  },
  {
    value: 'whimsical',
    regex: /whimsical.com/u,
    icon: WhimsicalIcon as StaticImageData,
  },
  {
    value: 'pitch',
    regex: /pitch.com/u,
    icon: PitchIcon as StaticImageData,
  },
  {
    value: 'zoom',
    regex: /zoom.us/u,
    icon: ZoomIcon as StaticImageData,
  },
];

export const CreateInitiativeLinkButton = ({
  initiativeId,
}: CreateInitiativeLinkButtonProperties) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [href, setHref] = useState('');
  const [loading, setLoading] = useState(false);
  const disabled = loading || !title.trim() || !href.trim();

  const onClick = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      const response = await createInitiativeLink(initiativeId, title, href);

      if ('error' in response) {
        throw new Error(response.error);
      }

      setOpen(false);
      setTitle('');
      setHref('');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const icon = externalLinkProperties.find((property) =>
    property.regex.test(href)
  )?.icon;

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Add a new link"
      description="Create a single source of truth by linking to external resources like Dropbox, Figma, GitHub, Google and more."
      onClick={onClick}
      disabled={disabled}
      cta="Add link"
      trigger={
        <div>
          <Tooltip content="Add a new link">
            <Button size="icon" variant="ghost" className="-m-1.5 h-6 w-6">
              <PlusIcon size={16} />
              <span className="sr-only">Add link</span>
            </Button>
          </Tooltip>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Title"
          name="title"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="Design files"
        />

        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <div className="absolute bottom-2.5 left-2.5">
              {icon ? (
                <Image
                  src={icon}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
              ) : (
                <GlobeIcon size={16} className="text-muted-foreground" />
              )}
            </div>
            <Input
              label="Link"
              name="href"
              required
              value={href}
              onChangeText={setHref}
              placeholder="https://www.figma.com/file/..."
              className="pl-8"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
