'use client';

import { Select } from '@repo/design-system/components/precomposed/select';
import { LaptopMinimalIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

const themes = [
  { label: 'Light', value: 'light', icon: SunIcon },
  { label: 'Dark', value: 'dark', icon: MoonIcon },
  { label: 'System', value: 'system', icon: LaptopMinimalIcon },
];

export const ModeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <div className="max-w-[15rem]">
      <Select
        label="Theme"
        type="theme"
        value={theme}
        onChange={setTheme}
        data={themes}
        renderItem={({ label, value }) => {
          const theme = themes.find((theme) => theme.value === value);

          if (!theme) {
            return null;
          }

          return (
            <div className="flex items-center gap-2">
              <theme.icon size={16} className="text-muted-foreground" />
              <span>{label}</span>
            </div>
          );
        }}
      />
    </div>
  );
};
