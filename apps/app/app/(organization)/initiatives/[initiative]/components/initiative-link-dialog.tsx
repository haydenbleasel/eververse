"use client";

import type {
  Feature,
  FeatureStatus,
  Group,
  Product,
} from "@repo/backend/prisma/client";
import { Emoji } from "@repo/design-system/components/emoji";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Tooltip } from "@repo/design-system/components/precomposed/tooltip";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { linkInitiativeFeature } from "../actions/link-initiative-feature";
import { linkInitiativeGroup } from "../actions/link-initiative-group";
import { linkInitiativeProduct } from "../actions/link-initiative-product";

type InitiativeLinkDialogProps = {
  initiativeId: string;
  features: (Pick<Feature, "id" | "title"> & {
    status: Pick<FeatureStatus, "color">;
  })[];
  groups: Pick<Group, "id" | "name" | "emoji">[];
  products: Pick<Product, "id" | "name" | "emoji">[];
};

export const InitiativeLinkDialog = ({
  initiativeId,
  features,
  groups,
  products,
}: InitiativeLinkDialogProps) => {
  const [loading, setLoading] = useState(false);

  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const [selectedFeature, setSelectedFeature] = useState<string | undefined>(
    undefined
  );
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined
  );
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    undefined
  );

  const handleLinkFeature = async () => {
    if (!selectedFeature || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await linkInitiativeFeature(
        initiativeId,
        selectedFeature
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Feature linked successfully");
      setShowFeatureDialog(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGroup = async () => {
    if (!selectedGroup || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await linkInitiativeGroup(initiativeId, selectedGroup);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Group linked successfully");
      setShowGroupDialog(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProduct = async () => {
    if (!selectedProduct || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await linkInitiativeProduct(
        initiativeId,
        selectedProduct
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Product linked successfully");
      setShowProductDialog(false);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowFeatureDialog = () =>
    setTimeout(() => setShowFeatureDialog(true), 200);

  const handleShowGroupDialog = () =>
    setTimeout(() => setShowGroupDialog(true), 200);

  const handleShowProductDialog = () =>
    setTimeout(() => setShowProductDialog(true), 200);

  return (
    <>
      <DropdownMenu
        data={[
          { children: "Feature", onClick: handleShowFeatureDialog },
          { children: "Group", onClick: handleShowGroupDialog },
          { children: "Product", onClick: handleShowProductDialog },
        ]}
      >
        <Tooltip content="Link a new...">
          <Button className="-m-1.5 h-6 w-6" size="icon" variant="ghost">
            <PlusIcon size={16} />
            <span className="sr-only">Add a new contributor</span>
          </Button>
        </Tooltip>
      </DropdownMenu>

      <Dialog
        description="Link a new feature to this initiative."
        footer={
          <Button
            disabled={loading || !selectedFeature}
            onClick={handleLinkFeature}
          >
            Link Feature
          </Button>
        }
        modal={false}
        onOpenChange={setShowFeatureDialog}
        open={showFeatureDialog}
        title="Link a Feature"
      >
        <Select
          data={features.map((feature) => ({
            value: feature.id,
            label: feature.title,
          }))}
          onChange={setSelectedFeature}
          renderItem={(item) => {
            const status = features.find(
              (feature) => feature.id === item.value
            )?.status;

            if (!status) {
              return null;
            }

            return (
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: status.color }}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </div>
            );
          }}
          type="feature"
          value={selectedFeature}
        />
      </Dialog>

      <Dialog
        description="Link a new group to this initiative."
        footer={
          <Button
            disabled={loading || !selectedGroup}
            onClick={handleLinkGroup}
          >
            Link Group
          </Button>
        }
        modal={false}
        onOpenChange={setShowGroupDialog}
        open={showGroupDialog}
        title="Link a Group"
      >
        <Select
          data={groups.map((group) => ({
            value: group.id,
            label: group.name,
          }))}
          onChange={setSelectedGroup}
          renderItem={(item) => {
            const group = groups.find((group) => group.id === item.value);

            if (!group) {
              return null;
            }

            return (
              <div className="flex items-center gap-2">
                <Emoji id={group.emoji} size="0.825rem" />
                <span className="flex-1 truncate">{item.label}</span>
              </div>
            );
          }}
          type="group"
          value={selectedGroup}
        />
      </Dialog>

      <Dialog
        description="Link a new product to this initiative."
        footer={
          <Button
            disabled={loading || !selectedProduct}
            onClick={handleLinkProduct}
          >
            Link Product
          </Button>
        }
        modal={false}
        onOpenChange={setShowProductDialog}
        open={showProductDialog}
        title="Link a Product"
      >
        <Select
          data={products.map((product) => ({
            value: product.id,
            label: product.name,
          }))}
          onChange={setSelectedProduct}
          renderItem={(item) => {
            const product = products.find(
              (product) => product.id === item.value
            );

            if (!product) {
              return null;
            }

            return (
              <div className="flex items-center gap-2">
                <Emoji id={product.emoji} size="0.825rem" />
                <span className="flex-1 truncate">{item.label}</span>
              </div>
            );
          }}
          type="product"
          value={selectedProduct}
        />
      </Dialog>
    </>
  );
};
