'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes'; // Assuming next-themes is or will be installed for theme toggling
import { useEffect, useState } from 'react';

export default function AppHeader() {
  const [mounted, setMounted] = useState(false);
  // const { theme, setTheme } = useTheme(); // Placeholder if next-themes is used

  useEffect(() => {
    setMounted(true);
  }, []);

  // const toggleTheme = () => {
  //   setTheme(theme === 'dark' ? 'light' : 'dark');
  // };

  if (!mounted) {
    return <div className="h-16 md:h-14" />; // Placeholder for initial render to avoid layout shift
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:h-14 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold md:text-xl">Portfolio Revamp</h1>
      <div className="ml-auto flex items-center gap-2">
        {/* Placeholder for theme toggle - install next-themes if needed
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        */}
      </div>
    </header>
  );
}
