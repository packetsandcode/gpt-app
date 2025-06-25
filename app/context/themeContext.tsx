'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    const applyTheme = (theme: Theme) => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);

        // Optional: If using CSS variables, manually override them
        const root = document.documentElement;

        if (theme === 'dark') {
            root.style.setProperty('--background', '#0a0a0a');
            root.style.setProperty('--foreground', '#ededed');
        } else {
            root.style.setProperty('--background', '#ffffff');
            root.style.setProperty('--foreground', '#171717');
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = stored || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        // document.documentElement.classList.toggle('dark', initialTheme === 'dark');
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');

        }

        setMounted(true);
        applyTheme(initialTheme);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        // document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        applyTheme(nextTheme);
    };

    if (!mounted) return null;
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
