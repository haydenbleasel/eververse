'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { DropdownMenu } from '@repo/design-system/components/precomposed/dropdown-menu';
import { Button } from '@repo/design-system/components/ui/button';

export const ModeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu
      data={[
        { onClick: () => setTheme('light'), children: 'Light' },
        { onClick: () => setTheme('dark'), children: 'Dark' },
        { onClick: () => setTheme('system'), children: 'System' },
      ]}
    >
      <Button variant="outline" size="icon" className="text-foreground">
        <SunIcon className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenu>
  );
};
