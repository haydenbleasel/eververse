"use client";

import { ThemeSwitcher } from "@repo/design-system/components/kibo-ui/theme-switcher";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeSwitcher
      className="w-fit"
      onChange={setTheme}
      value={theme as "light" | "dark" | "system"}
    />
  );
};
