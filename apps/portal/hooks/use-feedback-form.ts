import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type FeedbackFormState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  name: string;
  setName: (name: string) => void;
};

export const useFeedbackForm = create<FeedbackFormState>()(
  devtools(
    persist(
      (set) => ({
        open: false,
        setOpen: (open) => set({ open }),
        email: '',
        setEmail: (email) => set({ email }),
        name: '',
        setName: (name) => set({ name }),
      }),
      {
        name: 'eververse-portal:feedback-form',
      }
    )
  )
);
