import { memo, type Dispatch, type SetStateAction } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../common/tooltip";
import { Button } from "../../common/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UseChatHelpers } from '@ai-sdk/react';
import { Attachment, UIMessage } from "ai";
import equal from "fast-deep-equal";

function PureGenerateChat({
    messages,
    setMessages,
    chatId,
    sessionId,
    setSessionId,
}: {
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    chatId: string;
    sessionId?: string;
    setSessionId: Dispatch<SetStateAction<string | undefined>>;
}) {
    const router = useRouter();
    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
                        onClick={() => {
                            setMessages([]);
                            router.push('/');
                            router.refresh();
                            setSessionId('');
                            // window.history.replaceState({}, `/chat/${chatId}`, '');
                            console.log("2222222222222222222")
                        }}
                    >
                        <PlusIcon />
                        <span className="md:sr-only">New Chat</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
        </>
    )
}

export const GenerateChat = memo(PureGenerateChat, (prevProps, nextProps) => {
    if (prevProps.messages !== nextProps.messages)  return false;
    if (!equal(prevProps.sessionId, nextProps.sessionId))   return false;
    return true;
})