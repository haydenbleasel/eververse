import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { database } from "@/lib/database";
import { InstallIntercom } from "./components/install";
import { ManageIntercom } from "./components/manage";

export const metadata: Metadata = createMetadata({
  title: "Intercom Integration",
  description: "Configure your Intercom integration settings.",
});

const IntercomSettings = async () => {
  const intercomInstallation = await database.intercomInstallation.findFirst({
    select: { id: true, appId: true },
  });

  if (!intercomInstallation) {
    return <InstallIntercom />;
  }

  return (
    <ManageIntercom
      appId={intercomInstallation.appId}
      id={intercomInstallation.id}
    />
  );
};

export default IntercomSettings;
