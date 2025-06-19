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

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = stored || (prefersDark ? 'dark' : 'light');
        document.documentElement.classList.add('transition-none');
        setTimeout(() => {
            document.documentElement.classList.remove('transition-none');
        }, 0);
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.add('transition-none');
        setTimeout(() => {
            document.documentElement.classList.remove('transition-none');
        }, 0);
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

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
