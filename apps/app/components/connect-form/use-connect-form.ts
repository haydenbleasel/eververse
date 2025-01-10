import type { Feature } from '@prisma/client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ShowProperties = {
  featureId: Feature['id'] | null;
};

type ConnectFormState = {
  isOpen: boolean;
  show: (properties?: ShowProperties) => void;
  hide: () => void;
  toggle: () => void;
  featureId: Feature['id'] | null;
};

export const useConnectForm = create<ConnectFormState>()(
  devtools(
    (set) => ({
      isOpen: false,
      featureId: null,
      show: (properties) =>
        set({
          isOpen: true,
          featureId: properties?.featureId,
        }),
      hide: () =>
        set({
          isOpen: false,
          featureId: null,
        }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'eververse:connect-form',
    }
  )
);
