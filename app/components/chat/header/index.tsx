'use client';

import { memo, useEffect, useState, useRef, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { SidebarToggle } from "./sidebar-toggle";
import { GenerateChat } from "./generate-chat";
import { ModelSelector } from "./model-selector";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";
import { Button } from "../../common/button";
import "./index.css";
import { jwtDecode } from "jwt-decode";
import type { UseChatHelpers } from '@ai-sdk/react';
import { Attachment, UIMessage } from "ai";
import equal from "fast-deep-equal";
import { useTheme } from "@/app/context/themeContext";
import { ThemeToggle } from "../../common/toggle-theme";
import { ChevronDown, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useSidebar } from "@/app/components/common/sidebar";
import { classname } from "../../common/utils";

interface TokenPayload {
    email?: string;
    name?: string;
    [key: string]: any;
}

function PureChatHeader({ chatId, selectedModelId, selectedVisibilityType, messages, setMessages, sessionId, setSessionId }: {
    chatId: string;
    selectedModelId: string;
    selectedVisibilityType: VisibilityType;
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    sessionId?: string;
    setSessionId: Dispatch<SetStateAction<string | undefined>>;
}) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();
    const [showSettings, setShowSettings] = useState(false);
    const { open, setOpen } = useSidebar();

    useEffect(() => {
        const token = localStorage.getItem("firebase_jwt");
        if (token) {
            try {
                const decoded: TokenPayload = jwtDecode(token);
                setEmail(decoded.email || null);
                setName(decoded.name || null);
                setIsLoggedIn(true);
            } catch (err) {
                console.error("Invalid token", err);
                setIsLoggedIn(false);
                setEmail(null);
                setName(null);
            }
        } else {
            setIsLoggedIn(false);
            setEmail(null);
            setName(null);
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("firebase_jwt");
        setIsLoggedIn(false);
        setEmail(null);
        setName(null);
        setMessages([]);
        setOpen(false);
        router.push("/auth/login");
    };

    return (
        <div className="w-100 flex justify-between border-b-1 border-zinc-200">
            <div className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
                <SidebarToggle />
                <GenerateChat
                    messages={messages}
                    setMessages={setMessages}
                    chatId={chatId}
                    sessionId={sessionId}
                    setSessionId={setSessionId}
                />
                <ModelSelector
                    selectedModelId={selectedModelId}
                    className="order-1 md:order-2"
                />
                <VisibilitySelector
                    chatId={chatId}
                    selectedVisibilityType={selectedVisibilityType}
                    className="order-1 md:order-3"
                />
            </div>

            <div className={classname("flex items-center p-4 relative", open ? "right-[240px]" : "right-0")} ref={dropdownRef}>
                {!isLoggedIn ? (
                    <>
                        <Button
                            className="bg-blue-600 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto mx-2"
                            onClick={() => router.push('/auth/login')}
                        >
                            Login
                        </Button>
                        <Button
                            className="bg-indigo-600 dark:bg-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
                            onClick={() => router.push('/auth/signup')}
                        >
                            Register
                        </Button>
                    </>
                ) : (
                    <div className="relative">
                        <Button
                            onClick={() => setShowDropdown((prev) => !prev)}
                            className="bg-green-600 dark:bg-zinc-200 text-white dark:text-black py-1.5 px-3 h-fit md:h-[34px] rounded-full hover:cursor-pointer"
                        >
                            {name?.slice(0, 1) ?? 'User'}
                        </Button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-800 shadow-lg rounded-md z-50">
                                {!showSettings ? (
                                    <>
                                        <button
                                            onClick={() => setShowSettings(true)}
                                            className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm flex items-center gap-2"
                                        >
                                            <Settings size={16} /> Settings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm flex items-center gap-2"
                                        >
                                            <LogOut size={16} /> Log Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            onClick={toggleTheme}
                                            className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm flex items-center gap-2"
                                        >
                                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
    if (prevProps.messages !== nextProps.messages) return false;
    if (!equal(prevProps.selectedVisibilityType, nextProps.selectedVisibilityType)) return false;
    if (!equal(prevProps.sessionId, nextProps.sessionId)) return false;
    return true;
});
