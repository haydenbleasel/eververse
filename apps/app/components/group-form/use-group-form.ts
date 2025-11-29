import { create } from "zustand";
import { devtools } from "zustand/middleware";

type GroupFormState = {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

export const useGroupForm = create<GroupFormState>()(
  devtools(
    (set) => ({
      isOpen: false,
      show: () => set({ isOpen: true }),
      hide: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "eververse:group-form",
    }
  )
);
