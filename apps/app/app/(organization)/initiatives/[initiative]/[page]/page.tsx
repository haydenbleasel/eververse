import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { getJsonColumnFromTable } from "@repo/backend/database";
import type { CanvasState } from "@repo/canvas";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { database } from "@/lib/database";
import { InitiativeCanvasLoader } from "../components/initiative-canvas";
import { InitiativeCanvasDropdown } from "../components/initiative-canvas-dropdown";
import { InitiativePageEditor } from "../components/initiative-page-editor";
import { InitiativePageTitle } from "../components/initiative-page-title";

type InitiativeProperties = {
  readonly params: Promise<{
    readonly initiative: string;
    readonly page: string;
  }>;
};

export const generateMetadata = async (
  props: InitiativeProperties
): Promise<Metadata> => {
  const params = await props.params;
  const [page, canvas] = await Promise.all([
    database.initiativePage.findUnique({
      where: {
        id: params.page,
        initiativeId: params.initiative,
      },
      select: {
        title: true,
      },
    }),
    database.initiativeCanvas.findFirst({
      where: {
        id: params.page,
        initiativeId: params.initiative,
      },
      select: {
        title: true,
      },
    }),
  ]);

  const resolvedPage = page ?? canvas;

  if (!resolvedPage) {
    return {};
  }

  return createMetadata({
    title: resolvedPage.title,
    description: "A page in an initiative",
  });
};

const Initiative = async (props: InitiativeProperties) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    notFound();
  }

  const [page, canvas, organization] = await Promise.all([
    database.initiativePage.findUnique({
      where: {
        id: params.page,
        initiativeId: params.initiative,
      },
      select: {
        id: true,
        title: true,
        initiative: {
          select: {
            title: true,
          },
        },
      },
    }),
    database.initiativeCanvas.findFirst({
      where: {
        id: params.page,
        initiativeId: params.initiative,
      },
      select: {
        title: true,
        id: true,
        initiative: {
          select: {
            title: true,
          },
        },
      },
    }),
    database.organization.findUnique({
      where: { id: organizationId },
      select: { stripeSubscriptionId: true },
    }),
  ]);

  if (!organization) {
    return notFound();
  }

  if (canvas) {
    const content = await getJsonColumnFromTable(
      "initiative_canvas",
      "content",
      canvas.id
    );

    return (
      <div className="relative flex flex-1">
        <InitiativeCanvasDropdown
          canvasId={params.page}
          defaultTitle={canvas.title}
        />
        <InitiativeCanvasLoader
          defaultValue={content as unknown as CanvasState | undefined}
          editable={
            user.user_metadata.organization_role !== EververseRole.Member
          }
          initiativeCanvasId={params.page}
        />
      </div>
    );
  }

  if (page) {
    const content = await getJsonColumnFromTable(
      "initiative_page",
      "content",
      page.id
    );

    return (
      <div className="relative">
        {/* <InitiativeSettingsDropdown initiativeId={params.initiative} /> */}
        <div className="w-full px-6 py-16">
          <div className="mx-auto grid w-full max-w-prose gap-6">
            <InitiativePageTitle
              defaultTitle={page.title}
              editable={
                user.user_metadata.organization_role !== EververseRole.Member
              }
              pageId={params.page}
            />
            <InitiativePageEditor
              defaultValue={content as never}
              editable={
                user.user_metadata.organization_role !== EververseRole.Member
              }
              pageId={params.page}
            />
          </div>
        </div>
      </div>
    );
  }

  return notFound();
};

export default Initiative;
