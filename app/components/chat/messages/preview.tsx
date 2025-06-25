import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { Attachment } from "ai";
import { memo } from "react";
import equal from 'fast-deep-equal';
import { classname, sanitizeText } from "../../common/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../common/tooltip";
import { Button } from "../../common/button";
import { PencilEditIcon, SparklesIcon } from "../../common/icons";
import { Markdown } from "../../common/markdown";
import { DocumentPreview } from "./preview-document";
import { AnimatePresence, motion } from 'framer-motion';
import { useSharedData } from "@/app/context/sharedDataContext";
import cx from 'classnames';
import { MessageReasoning } from "./message-reasoning";
import { MessageActions } from "./message-actions";
import type { Vote } from "@/app/lib/db/schema";
import { PreviewAttachment } from "../../common/preview-attachment";

function PurePreviewMessage({ message, requiresScrollPadding, isLoading, isReadonly, chatId, vote }: {
    message: UIMessage & { attachments?: Attachment[] };
    requiresScrollPadding: boolean;
    isLoading: boolean;
    isReadonly: boolean;
    chatId: string;
    vote: Vote | undefined;
}) {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const { currentMessages, attachments, secondAttachments } = useSharedData();

    useEffect(() => {
        console.log("PPPPPPPPPPPPPPPPPPPPP", message, attachments)
    })
    return (
        <AnimatePresence>
            <motion.div
                data-testid={`message-${message.role}`}
                className="w-full mx-auto max-w-3xl px-4 group/message"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                data-role={message.role}
            >
                <div className={classname(
                    'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
                    {
                        'w-full': mode === 'edit',
                        'group-data-[role=user]/message:w-fit': mode !== 'edit',
                    },
                )}>
                    {message.role === 'assistant' && (
                        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                            <div className="translate-y-px">
                                <SparklesIcon size={14} />
                            </div>
                        </div>
                    )}
                    <div
                        className={classname('flex flex-col gap-4 w-full')}
                    >
                        <div
                            data-testid={`message-attachments`}
                            className='flex flex-row justify-end gap-2'
                        >
                            {message.role === 'assistant' ? (
                                message.attachments?.map((attachment) => (
                                    <PreviewAttachment
                                        key={attachment.url}
                                        attachment={attachment}
                                    />
                                ))
                            ) : (
                                attachments?.map((attachment) => (
                                    <PreviewAttachment
                                        key={attachment.url}
                                        attachment={attachment}
                                    />
                                ))
                            )}
                        </div>

                        {message.parts?.map((part, index) => {
                            const { type } = part;
                            const key = `message-${message.id}-part-${index}`;

                            if (type === 'reasoning') {
                                return (
                                    <MessageReasoning
                                        key={key}
                                        isLoading={isLoading}
                                        reasoning={part.reasoning}
                                    />
                                );
                            }

                            if (type === 'text') {
                                if (mode === 'view') {
                                    return (
                                        <div key={key} className="flex flex-row gap-2 items-start w-full">
                                            {!isReadonly && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            data-testid="message-edit-button"
                                                            variant="ghost"
                                                            className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                                                            onClick={() => {
                                                                setMode('edit');
                                                            }}
                                                        >
                                                            <PencilEditIcon />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit message</TooltipContent>
                                                </Tooltip>
                                            )}
                                            <div data-testid="message-content"
                                                className={classname('flex flex-col gap-4', {
                                                    'bg-gray-200 text-black px-3 py-2 rounded-xl':
                                                        message.role === 'user',
                                                })}>
                                                {(message as any).title && (
                                                    <div className="text-lg text-right rounded-xl bg-gray-200 text-black px-3 py-2 self-end">
                                                        <p>{(message as any).title ?? 'Untitled'}</p>
                                                    </div>
                                                )}
                                                <Markdown>{sanitizeText(part?.text || message?.content || '')}</Markdown>
                                            </div>
                                        </div>
                                    )
                                }
                            }

                            if (type === 'tool-invocation') {
                                const { toolInvocation } = part;
                                const { toolName, toolCallId, state } = toolInvocation;

                                const { args } = toolInvocation;
                                return (
                                    <div key={toolCallId}
                                        className={classname({
                                            skeleton: ['getWeather'].includes(toolName),
                                        })}>
                                        {toolName === 'createDocument' && (
                                            <DocumentPreview
                                                isReadonly={isReadonly}
                                                args={args}
                                            />
                                        )}
                                    </div>
                                )
                            }
                        })}
                        {!isReadonly && (
                            <MessageActions
                                key={`action-${message.id}`}
                                chatId={chatId}
                                message={message}
                                vote={vote}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>

    )
}

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (!equal(prevProps.message.content, nextProps.message.content)) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.message.attachments, prevProps.message.attachments)) return false;
    return true;
})

export const ThinkingMessage = () => {
    const role = 'assistant';

    return (
        <motion.div
            data-testid="message-assistant-loading"
            className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
            data-role={role}
        >
            <div
                className={cx(
                    'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
                    {
                        'group-data-[role=user]/message:bg-muted': true,
                    },
                )}
            >
                <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
                    <SparklesIcon size={14} />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col gap-4 text-muted-foreground">
                        Hmm...
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
