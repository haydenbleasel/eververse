import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ChangelogFormState = {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

export const useChangelogForm = create<ChangelogFormState>()(
  devtools(
    (set) => ({
      isOpen: false,
      show: () => set({ isOpen: true }),
      hide: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'eververse:changelog-form',
    }
  )
);
