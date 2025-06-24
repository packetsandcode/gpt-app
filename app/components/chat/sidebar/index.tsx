'use client';

import { useSidebar } from "@/app/components/common/sidebar";
import { classname } from "../../common/utils";
import { useUserSessions } from '@/app/lib/useUserSessions';
import { useSharedData } from "@/app/context/sharedDataContext";
import { supabase } from '@/app/lib/supabaseClient';
import { useEffect } from "react";

export function SidebarPage() {
    const { open } = useSidebar();
    const { sessions } = useUserSessions();
    const { setCurrentSessionId, setCurrentMessages } = useSharedData();

    const handleClick = async (sessionId: string) => {
        setCurrentSessionId(sessionId);

        // Fetch messages for the session from Supabase
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            setCurrentMessages([]);
            return;
        }

        setCurrentMessages(messages ?? []);
    };

    return (
        <div
            className={classname(
                "transition-all duration-300 ease-in-out overflow-hidden h-full",
                open ? "w-[240px] flex-1" : "w-0 flex-1"
            )}
        >
            <div className="h-screen bg-zinc-500/5 text-dark shadow-md flex flex-col border-r-1 border-zinc-200">
                <p className="text-xl font-semibold p-4">Recent</p>
                {/* Scrollable area */}
                <div className="flex-1 overflow-y-auto px-4 space-y-1 light-scrollbar mt-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => handleClick(session.id)}
                            className="cursor-pointer py-2 rounded-2xl hover:bg-gray-600 dark:hover:bg-gray-900 transition-colors"
                        >
                            <div className="text-sm text-dark">
                                {session.messages?.[0]?.title
                                    ? session.messages[0].title.length > 25
                                        ? session.messages[0].title.slice(0, 25) + "..."
                                        : session.messages[0].title
                                    : "Untitled"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
