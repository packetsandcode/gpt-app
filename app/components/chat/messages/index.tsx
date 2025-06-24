'use client';

import { memo, useState, useEffect, type Dispatch, type SetStateAction } from "react";
import type { UIMessage } from 'ai';
import { Attachment } from "ai"
import { Greetings } from "./greetings";
import { PreviewMessage, ThinkingMessage } from "./preview";
import type { UseChatHelpers } from '@ai-sdk/react';
import { useMessages } from "@/app/hooks/use-messages";
import { motion } from "framer-motion";
import { useSharedData } from "@/app/context/sharedDataContext";
import type { Vote } from "@/app/lib/db/schema";
import equal from "fast-deep-equal";

interface MessagesProps {
    chatId: string;
    status: UseChatHelpers['status'];
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    isReadonly: boolean;
    className: string;
    votes: Array<Vote> | undefined;
    isArtifactVisible: boolean;
}

function PureMessages({ chatId, status, messages, setMessages, isReadonly, className, votes }: MessagesProps) {
    const {
        hasSentMessage,
        endRef: messagesEndRef,
        onViewportEnter,
        onViewportLeave,
    } = useMessages({
        chatId,
        status
    });
    const { currentMessages, attachments, setAttachments } = useSharedData();
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
        <div className={`flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative ${className}`}>
            {messages.length === 0 && <Greetings />}
            {messages.map((msg, idx) => (
                <PreviewMessage
                    key={msg.id}
                    message={msg}
                    requiresScrollPadding={hasSentMessage && msg === messages[messages.length - 1]}
                    isLoading={status === 'streaming' && msg === messages[messages.length - 1]}
                    isReadonly={isReadonly}
                    chatId={chatId}
                    vote={
                        votes
                            ? votes.find((vote) => vote.messageId === msg.id)
                            : undefined
                    }
                />
            ))}
            {
                // status === 'submitted' &&
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
    if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    return true;
})