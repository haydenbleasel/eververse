import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type FeedbackOptions = {
  showProcessed: boolean;
  toggleShowProcessed: () => void;
};

export const useFeedbackOptions = create<FeedbackOptions>()(
  devtools(
    persist(
      (set) => ({
        showProcessed: false,
        toggleShowProcessed: () =>
          set((state) => ({ showProcessed: !state.showProcessed })),
      }),
      {
        name: "eververse-feedback-options",
      }
    )
  )
);
