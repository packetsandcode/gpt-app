import { memo } from "react";
import { Button } from "./button";
import { ArrowUpIcon } from "./icons";

function PureSendButton({ submitForm, input, uploadQueue }: {
    submitForm: () => void;
    input: string;
    uploadQueue: Array<string>;
}) {
    return (
        <Button
            data-testid="send-button"
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            onClick={(event) => {
                event.preventDefault();
                submitForm();
            }}
            disabled={input.length === 0 || uploadQueue.length > 0}
        >
            <ArrowUpIcon size={14} />
        </Button>
    )
}

export const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input)    return false;
    if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)  return false;
    return true;
})