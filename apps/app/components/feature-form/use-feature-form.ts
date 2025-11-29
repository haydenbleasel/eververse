import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ShowProperties = {
  groupId?: string | undefined;
  productId?: string | undefined;
};

type FeatureFormState = {
  isOpen: boolean;
  show: (properties?: ShowProperties) => void;
  hide: () => void;
  setOpen: (isOpen: boolean) => void;
  groupId: string | undefined;
  productId: string | undefined;
  setGroupId: (groupId: string | undefined) => void;
  setProductId: (productId: string | undefined) => void;
};

export const useFeatureForm = create<FeatureFormState>()(
  devtools(
    (set) => ({
      isOpen: false,
      groupId: undefined,
      productId: undefined,
      show: (properties) =>
        set({
          isOpen: true,
          groupId: properties?.groupId,
          productId: properties?.productId,
        }),
      hide: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
      setGroupId: (groupId) => set({ groupId }),
      setProductId: (productId) => set({ productId }),
    }),
    {
      name: "eververse:feature-form",
    }
  )
);
