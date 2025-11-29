import { create } from "zustand";
import { devtools } from "zustand/middleware";

type InitiativeFormState = {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

export const useInitiativeForm = create<InitiativeFormState>()(
  devtools(
    (set) => ({
      isOpen: false,
      show: () => set({ isOpen: true }),
      hide: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "eververse:initiative-form",
    }
  )
);
