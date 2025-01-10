import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type CommandBarState = {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

export const useCommandBar = create<CommandBarState>()(
  devtools(
    (set) => ({
      isOpen: false,
      show: () => set({ isOpen: true }),
      hide: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'eververse:command-bar',
    }
  )
);
