import { memo } from "react";
import { Button } from "./button";
import { StopIcon } from "./icons";
import type { UseChatHelpers } from '@ai-sdk/react';

function PureStopButton({
    stop,
    setMessages,
}: {
    stop: () => void;
    setMessages: UseChatHelpers['setMessages'];
}) {
    return (
        <Button
            data-testid="stop-button"
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            onClick={(event) => {
                event.preventDefault();
                stop();
                setMessages((messages) => messages);
            }}
        >
            <StopIcon size={14} />
        </Button>
    )
}

export const StopButton = memo(PureStopButton, () => {
    return true;
});