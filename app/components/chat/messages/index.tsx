'use client';

import { memo, useState, useEffect } from "react";
import type { UIMessage } from 'ai';
import { Greetings } from "./greetings";
import { PreviewMessage, ThinkingMessage } from "./preview";
import type { UseChatHelpers } from '@ai-sdk/react';
import { useMessages } from "@/app/hooks/use-messages";
import { motion } from "framer-motion";
import { useSharedData } from "@/app/context/sharedDataContext";

interface MessagesProps {
    chatId: string;
    status: UseChatHelpers['status'];
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    isReadonly: boolean;
}

function PureMessages({ chatId, status, messages, setMessages, isReadonly }: MessagesProps) {
    const {
        hasSentMessage,
        endRef: messagesEndRef,
        onViewportEnter,
        onViewportLeave,
    } = useMessages({
        chatId,
        status
    });
    const { currentMessages } = useSharedData();
    const [currentMsgs, setCurrentMsgs] = useState<any[]>([]);

    useEffect(() => {
        setCurrentMsgs(currentMessages);
        console.log("=====================", currentMsgs.length)
    });

    useEffect(() => {
        setMessages(currentMsgs);
    }, [currentMsgs.length])

    useEffect(() => {
        console.log("hhhhhhhhhhhhhhhhhhhhh", messages)
    }, [messages.length])
    return (
        <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative mb-48">
            {messages.length === 0 && <Greetings />}
            {messages.map((msg, idx) => (
                <PreviewMessage
                    key={msg.id}
                    message={msg}
                    requiresScrollPadding={hasSentMessage && msg === messages[messages.length - 1]}
                    isLoading={status === 'streaming' && msg === messages[messages.length - 1]}
                    isReadonly={isReadonly}
                />
            ))}
            {status === 'submitted' &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

            <motion.div
                ref={messagesEndRef}
                className="shrink-0 min-w-[24px] min-h-[24px]"
                onViewportLeave={onViewportLeave}
                onViewportEnter={onViewportEnter}
            />
        </div>
    )
}
export const Messages = memo(PureMessages, (prevProps, nextProps) => {
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    return true;
})