import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/design-system/components/ui/resizable";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SettingsNavigation } from "./components/settings-navigation";

type SettingsLayoutProperties = {
  readonly children: ReactNode;
};

const SettingsLayout = async ({ children }: SettingsLayoutProperties) => {
  const user = await currentUser();

  if (!user || user.user_metadata.organization_role !== EververseRole.Admin) {
    notFound();
  }

  return (
    <ResizablePanelGroup
      className="flex-1"
      direction="horizontal"
      style={{ overflow: "unset" }}
    >
      <ResizablePanel
        className="sticky top-0 h-screen"
        defaultSize={20}
        maxSize={25}
        minSize={15}
        style={{ overflow: "auto" }}
      >
        <SettingsNavigation />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        className="flex min-h-screen flex-col"
        defaultSize={80}
        style={{ overflow: "unset" }}
      >
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default SettingsLayout;
