'use client';

import { ThemeSwitcher } from '@repo/design-system/components/ui/kibo-ui/theme-switcher';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeSwitcher
      className="w-fit"
      value={theme as 'light' | 'dark' | 'system'}
      onChange={setTheme}
    />
  );
};
