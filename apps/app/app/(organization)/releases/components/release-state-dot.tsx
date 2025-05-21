import type { Release } from '@repo/backend/prisma/client';
import { tailwind } from '@repo/tailwind-config';

const getBackgroundColor = (state: Release['state']) => {
  if (state === 'COMPLETED') {
    return tailwind.theme.colors.emerald[500];
  }

  if (state === 'ACTIVE') {
    return tailwind.theme.colors.amber[500];
  }

  if (state === 'CANCELLED') {
    return tailwind.theme.colors.rose[500];
  }

  return tailwind.theme.colors.gray[200];
};

type ReleaseStateDotProps = {
  state: Release['state'];
};

export const ReleaseStateDot = ({ state }: ReleaseStateDotProps) => {
  return (
    <div
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: getBackgroundColor(state) }}
    />
  );
};
