'use client';

import Link from "next/link";
import { Briefcase, LayoutGrid, Palette, Sun, Moon } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import { useTheme } from "@/components/theme/theme-provider";

export function AppHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            The Soul Storage
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/resume"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <Briefcase size={16} />
              <span>Experience</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <LayoutGrid size={16} />
              <span>输出</span>
            </Link>
            <Link
              href="/mood-diary"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <Palette size={16} />
              <span>作品集</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-8 h-8 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
