"use client";

import { memo, useEffect, useState } from "react";
import { ChatHeader } from "./header";
import { Messages } from "./messages";
import type { VisibilityType } from "./header/visibility-selector";
import { MultimodalInput } from "./multimodal-input";
import { useChat } from '@ai-sdk/react';
import type { Attachment, UIMessage } from 'ai';
import { generateUUID } from "../common/utils";
import { fetchWithErrorHandlers } from "../common/utils";
import { useChatVisibility } from "@/app/hooks/use-chat-visibility";
import useSWR, { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from "./sidebar/sidebar-history";
import { ChatSDKError } from "@/app/lib/errors";
import { toast } from "./toast";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

function PureChat({ id, initialMessages, initialChatModel, initialVisibilityType, isReadonly }: {
    id: string;
    initialMessages: Array<UIMessage>;
    initialChatModel: string;
    initialVisibilityType: VisibilityType;
    isReadonly: boolean;
}) {
    const { visibilityType } = useChatVisibility({
        chatId: id,
        initialVisibilityType,
    });
    const { mutate } = useSWRConfig();
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    
    const { messages, setMessages, append, input, setInput, handleSubmit, status } = useChat({
        id,
        initialMessages,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        generateId: generateUUID,
        fetch: fetchWithErrorHandlers,
        experimental_prepareRequestBody: (body) => ({
            id,
            message: body.messages,
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
        }),
        onFinish: () => {
            mutate(unstable_serialize(getChatHistoryPaginationKey));
        },
        onError: (error) => {
            if (error instanceof ChatSDKError) {
                toast({
                    type: 'error',
                    description: error.message,
                });
            }
        },
    });
    const [attachments, setAttachments] = useState<Array<Attachment>>([]);

    useAuthGuard();

    useEffect(() => {
        console.log("yyyyyyyyyyyyyyyyyy", input)
        console.log('uuuuuuuuuuuuuuuuuuu', messages)
    }, [input, messages])
    return (
            <div className="">
                <ChatHeader
                    chatId={id}
                    selectedModelId={initialChatModel}
                    selectedVisibilityType={initialVisibilityType}
                    messages={messages}
                    setMessages={setMessages}
                    sessionId={sessionId}
                    setSessionId={setSessionId}
                />
                <Messages
                    chatId={id}
                    status={status}
                    messages={messages}
                    setMessages={setMessages}
                    isReadonly={isReadonly}
                />
                <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
                    <MultimodalInput
                        chatId={id}
                        append={append}
                        selectedVisibilityType={visibilityType}
                        input={input}
                        setInput={setInput}
                        handleSubmit={handleSubmit}
                        attachments={attachments}
                        setAttachments={setAttachments}
                        status={status}
                        messages={messages}
                        setMessages={setMessages}
                        sessionId={sessionId}
                        setSessionId={setSessionId}
                    />
                </form>
            </div>
    )
}

export const Chat = memo(PureChat, () => {
    return true;
})