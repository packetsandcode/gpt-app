'use client';

import { motion } from 'framer-motion';
import { Button } from '../../common/button';
import { memo, useCallback, useEffect } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from '../header/visibility-selector';
import { Attachment, UIMessage } from "ai";
import { sendMessageToGemini } from '@/app/lib/gemini';
import { useRouter } from 'next/navigation';

interface SuggestedActionsProps {
    chatId: string;
    append: UseChatHelpers['append'];
    selectedVisibilityType: VisibilityType;
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
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
                        onClick={async () => {
                            if (!suggestedAction.action.trim()) return;
                            window.history.replaceState({}, '', `/chat/${chatId}`);

                            const userMessage: Message = {
                                id: `${Date.now()}-user`,
                                role: 'user',
                                content: suggestedAction.action,
                            };

                            // Optimistically update state with user message
                            setMessages((prevMessages) => {
                                const optimisticMessages = [...prevMessages, userMessage];

                                (async () => {
                                    try {
                                        const formattedMessages = optimisticMessages.map((m) => ({
                                            role: m.role,
                                            parts: [{ text: m.content }],
                                        }));

                                        const response = await sendMessageToGemini([
                                            ...formattedMessages,
                                            {
                                                role: 'user',
                                                parts: [{ text: suggestedAction.action }],
                                            },
                                        ]);

                                        const assistantMessage: Message = {
                                            id: `${Date.now()}-assistant`,
                                            role: 'assistant',
                                            content: response,
                                        };

                                        setMessages((updatedPrev) => [...updatedPrev, assistantMessage]);
                                    } catch (err) {
                                        console.error("Gemini error", err);
                                    }
                                })();

                                return optimisticMessages;
                            });
                        }}

                        className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
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
