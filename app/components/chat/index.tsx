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
import { fetcher } from "../common/utils";
import { user, type Vote } from "@/app/lib/db/schema";
import { useArtifactSelector } from "@/app/hooks/use-artifact";
import { useSharedData } from "@/app/context/sharedDataContext";

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

    const { messages, setMessages, append, input, setInput, handleSubmit, status, stop } = useChat({
        id,
        initialMessages,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        generateId: generateUUID,
        fetch: fetchWithErrorHandlers,
        experimental_prepareRequestBody: (body) => ({
            id,
            message: body.messages.at(-1),
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
    // const [attachments, setAttachments] = useState<Array<Attachment>>([]);
    const { attachments, setAttachments } = useSharedData();

    useAuthGuard();

    useEffect(() => {
        console.log("yyyyyyyyyyyyyyyyyy", input)
        console.log('uuuuuuuuuuuuuuuuuuu', messages)
        console.log("OOOOOOOOOOOOOOOOOO", attachments)
    }, [input, messages, attachments.length])

    const { data: votes } = useSWR<Array<Vote>>(
        messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
        fetcher,
    );

    const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-blue-124">
            <ChatHeader
                chatId={id}
                selectedModelId={initialChatModel}
                selectedVisibilityType={initialVisibilityType}
                messages={messages}
                setMessages={setMessages}
                sessionId={sessionId}
                setSessionId={setSessionId}
            />
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <Messages
                    chatId={id}
                    status={status}
                    messages={messages}
                    setMessages={setMessages}
                    isReadonly={isReadonly}
                    className="flex-1 overflow-y-auto"
                    votes={votes}
                    isArtifactVisible={isArtifactVisible}
                />
                <form className="relative w-full px-4 pb-4 md:pb-6 max-w-3xl mx-auto">
                    <MultimodalInput
                        chatId={id}
                        append={append}
                        selectedVisibilityType={visibilityType}
                        input={input}
                        setInput={setInput}
                        handleSubmit={handleSubmit}
                        status={status}
                        messages={messages}
                        setMessages={setMessages}
                        sessionId={sessionId}
                        setSessionId={setSessionId}
                        stop={stop}
                        className=""
                    />
                </form>
            </div>
        </div>
    )
}

export const Chat = memo(PureChat, () => {
    return true;
})