import { Separator } from "@repo/design-system/components/ui/separator";
import type { ReactNode } from "react";
import { useState } from "react";
import { GenerativeMenuSwitch } from "../plugins/ai";
import { FormatSelector } from "../selectors/format-selector";
import { LinkSelector } from "../selectors/link-selector";
import { NodeSelector } from "../selectors/node-selector";
import { TextButtons } from "../selectors/text-buttons";

export const BubbleMenu = ({ children }: { children?: ReactNode }) => {
  const [openNode, setOpenNode] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openFormat, setOpenFormat] = useState(false);
  const [openAi, setOpenAi] = useState(false);

  return (
    <GenerativeMenuSwitch onOpenChange={setOpenAi} open={openAi}>
      <Separator orientation="vertical" />
      <NodeSelector onOpenChange={setOpenNode} open={openNode} />
      <FormatSelector onOpenChange={setOpenFormat} open={openFormat} />
      <Separator orientation="vertical" />
      <LinkSelector onOpenChange={setOpenLink} open={openLink} />
      <Separator orientation="vertical" />
      <TextButtons />
      {children}
    </GenerativeMenuSwitch>
  );
};
