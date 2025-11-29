import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { CanvasState } from "@repo/canvas";
import { notFound } from "next/navigation";
import { database } from "@/lib/database";
import { FeatureCanvasLoader } from "./components/feature-canvas-loader";

type FeatureCanvasProperties = {
  readonly params: Promise<{
    readonly feature: string;
  }>;
};

export const dynamic = "force-dynamic";

const FeatureCanvas = async (props: FeatureCanvasProperties) => {
  const params = await props.params;
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const feature = await database.feature.findUnique({
    where: { id: params.feature },
    select: {
      title: true,
      canvas: true,
    },
  });

  if (!feature) {
    notFound();
  }

  return (
    <div className="relative flex flex-1">
      <FeatureCanvasLoader
        defaultValue={feature.canvas as unknown as CanvasState | undefined}
        editable={user.user_metadata.organization_role !== EververseRole.Member}
        featureId={params.feature}
      />
    </div>
  );
};

export default FeatureCanvas;
