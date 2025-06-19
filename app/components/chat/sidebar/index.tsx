// components/chat/sidebar/sidebar-page.tsx
'use client';

import { useSidebar } from "@/app/components/common/sidebar";
import { classname } from "../../common/utils";
import { useUserSessions } from '@/app/lib/useUserSessions';
import { useSharedData } from "@/app/context/sharedDataContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebaseClient";
import { useEffect } from "react";

export function SidebarPage() {
    const { open } = useSidebar();
    const { sessions } = useUserSessions();
    const { setCurrentSessionId, setCurrentMessages } = useSharedData();
    
    const handleClick = async (sessionId: string) => {
        setCurrentSessionId(sessionId);

        const messagesRef = collection(db, "sessions", sessionId, "messages");
        const snapshot = await getDocs(messagesRef);

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$", messages)
        // Sort by timestamp if available
        messages.sort((a, b) => {

            const timeA = (a as any).createdAt?.toMillis?.() ?? 0;
            const timeB = (b as any).createdAt?.toMillis?.() || 0;
            return timeA - timeB;
        });

        setCurrentMessages(messages);
    };

    return (
        <div
            className={classname(
                "transition-all duration-300 ease-in-out overflow-hidden h-full",
                open ? "w-[240px] flex-1" : "w-0 flex-1"
            )}
        >   
            <div className="h-screen bg-zinc-500/5 shadow-md flex flex-col border-r-1 border-zinc-200">
                <p className="text-xl font-semi-bold p-4">Chat History</p>
                {/* Scrollable area */}
                <div className="flex-1 overflow-y-auto px-4 space-y-1 light-scrollbar mt-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => handleClick(session.id)}
                            className="cursor-pointer py-2 rounded-2xl hover:bg-gray-100 transition-all"
                        >
                            <div className="text-sm text-gray-800">
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
