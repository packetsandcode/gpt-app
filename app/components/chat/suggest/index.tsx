'use client';

import { motion } from 'framer-motion';
import { Button } from '../../common/button';
import { memo, useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from '../header/visibility-selector';
import { Attachment, UIMessage } from "ai";
import { sendMessageToGemini } from '@/app/lib/gemini';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/app/lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { saveChatSessionAndMessages } from "@/app/lib/chatStorage";

type CustomStatus = 'ready' | 'submitted';
interface SuggestedActionsProps {
    chatId: string;
    append: UseChatHelpers['append'];
    selectedVisibilityType: VisibilityType;
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    customStatus: CustomStatus;
    setCustomStatus: React.Dispatch<React.SetStateAction<CustomStatus>>;
    sessionId?: string;
    setSessionId: Dispatch<SetStateAction<string | undefined>>;
}

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
};

function PureSuggestedActions({
    chatId,
    append,
    selectedVisibilityType,
    messages,
    setMessages,
    customStatus,
    setCustomStatus,
    sessionId,
    setSessionId,
}: SuggestedActionsProps) {
    const suggestedActions = [
        {
            title: 'What are the advantages',
            label: 'of using Next.js?',
            action: 'What are the advantages of using Next.js?',
        },
        {
            title: 'Write code to',
            label: `demonstrate djikstra's algorithm`,
            action: `Write code to demonstrate djikstra's algorithm`,
        },
        {
            title: 'Help me write an essay',
            label: `about silicon valley`,
            action: `Help me write an essay about silicon valley`,
        },
        {
            title: 'What is the weather',
            label: 'in San Francisco?',
            action: 'What is the weather in San Francisco?',
        },
    ];
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return unsubscribe;
    }, []);

    const submitForm = useCallback(async (suggestedAction: typeof suggestedActions[0]) => {
        if (!suggestedAction.action.trim()) return;
        window.history.replaceState({}, '', `/chat/${chatId}`);

        const userMessage: Message = {
            id: `${Date.now()}-user`,
            role: 'user',
            content: suggestedAction.action,
        };

        const optimisticMessages = [...messages, userMessage];
        setMessages(optimisticMessages);
        setCustomStatus('submitted');

        try {
            const formattedMessages = Array.isArray(messages)
                ? messages.map((m) => ({
                    role: m.role,
                    parts: [{ text: m.content }],
                }))
                : [];

            formattedMessages.push({
                role: "user",
                parts: [{ text: suggestedAction.action }],
            });

            console.log("Formatted Data: ", formattedMessages);

            const response = await sendMessageToGemini(formattedMessages);
            console.log("Gemini response:", response);

            const assistantMessage: Message = {
                id: `${Date.now()}-assistant`,
                role: 'assistant',
                content: response,
            };

            console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", assistantMessage)

            setMessages((prev) => [...prev, assistantMessage]);

            // Prepare chat messages array for Firestore saving (including latest user and assistant)
            const chatMessagesForFirestore = [
                {
                    role: 'assistant',
                    content: response,
                },
            ];
            console.log("eeeeeeeeeeeeeeeeeee", chatMessagesForFirestore);

            // Use first 40 chars of input as title
            const title = suggestedAction.action.slice(0, 40);

            // Save session and messages to Firestore
            const newSessionId = await saveChatSessionAndMessages({
                email: user.email ?? "",
                userId: user.uid,
                title: suggestedAction.action,                     // user input
                assistantResponse: response,      // assistant response
                sessionId: sessionId ?? undefined,
            });

            // Save sessionId in state for future appends
            setSessionId(newSessionId);
        } catch (error) {
            console.error("Error sending message: ", error);
        } finally {
            setCustomStatus('ready');
        }
    }, [
        chatId,
        messages,
        setMessages,
        setCustomStatus,
        suggestedActions,
        sessionId,
        user,
    ])
    useEffect(() => {
        console.log("****************", messages)
    }, [messages])

    return (
        <div
            data-testid="suggested-actions"
            className="grid sm:grid-cols-2 gap-2 w-full"
        >
            {suggestedActions.map((suggestedAction, index) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.05 * index }}
                    key={`suggested-action-${suggestedAction.title}-${index}`}
                    className={index > 1 ? 'hidden sm:block' : 'block'}
                >
                    <Button
                        variant="ghost"
                        onClick={(e) => {
                            e.preventDefault();
                            submitForm(suggestedAction);
                        }}

                        className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:cursor-pointer"
                    >
                        <span className="font-medium">{suggestedAction.title}</span>
                        <span className="text-muted-foreground">
                            {suggestedAction.label}
                        </span>
                    </Button>
                </motion.div>
            ))}
        </div>
    );
}

export const SuggestedActions = memo(
    PureSuggestedActions,
    (prevProps, nextProps) => {
        if (prevProps.chatId !== nextProps.chatId) return false;
        if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
            return false;
        if (prevProps.messages !== nextProps.messages) return false;
        return true;
    },
);
