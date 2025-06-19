'use client';

import { useTheme } from '@/app/context/themeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-sm w-full hover:text-blue-500 transition-colors"
        >
            {theme === 'dark' ? (
                <>
                    <Sun className="w-4 h-4" />
                    Light Mode
                </>
            ) : (
                <>
                    <Moon className="w-4 h-4" />
                    Dark Mode
                </>
            )}
        </button>
    );
};
