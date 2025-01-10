import { Separator } from '@repo/design-system/components/ui/separator';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { GenerativeMenuSwitch } from '../plugins/ai';
import { FormatSelector } from '../selectors/format-selector';
import { LinkSelector } from '../selectors/link-selector';
import { NodeSelector } from '../selectors/node-selector';
import { TextButtons } from '../selectors/text-buttons';

export const BubbleMenu = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const [openNode, setOpenNode] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openFormat, setOpenFormat] = useState(false);
  const [openAi, setOpenAi] = useState(false);

  return (
    <GenerativeMenuSwitch open={openAi} onOpenChange={setOpenAi}>
      <Separator orientation="vertical" />
      <NodeSelector open={openNode} onOpenChange={setOpenNode} />
      <FormatSelector open={openFormat} onOpenChange={setOpenFormat} />
      <Separator orientation="vertical" />
      <LinkSelector open={openLink} onOpenChange={setOpenLink} />
      <Separator orientation="vertical" />
      <TextButtons />
      {children}
    </GenerativeMenuSwitch>
  );
};
