/**
 * Theme Toggle - Light/Dark mode switch
 *
 * For use in TopNavbar. Switch: off = light, on = dark.
 */

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
      <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400/60" aria-hidden />
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      />
      <Moon className="h-4 w-4 text-slate-600 dark:text-blue-400" aria-hidden />
    </div>
  );
}
