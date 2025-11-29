import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ReleaseFormState = {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

export const useReleaseForm = create<ReleaseFormState>()(
  devtools(
    (set) => ({
      isOpen: false,
      show: () => set({ isOpen: true }),
      hide: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "eververse:release-form",
    }
  )
);
