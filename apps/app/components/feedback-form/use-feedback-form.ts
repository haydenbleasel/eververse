import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type FeedbackFormState = {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};

export const useFeedbackForm = create<FeedbackFormState>()(
  devtools(
    (set) => ({
      isOpen: false,
      show: () => set({ isOpen: true }),
      hide: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'eververse:feedback-form',
    }
  )
);
