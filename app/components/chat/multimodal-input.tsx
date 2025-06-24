// file: app/components/chat/multimodal-input.tsx
'use client'

import { memo, useState, useEffect, useRef, useCallback, type Dispatch, type SetStateAction, type ChangeEvent } from "react"
import type { UseChatHelpers } from '@ai-sdk/react'
import { SuggestedActions } from "./suggest"
import { VisibilityType } from "./header/visibility-selector"
import { Textarea } from "../common/textarea"
import cx from 'classnames'
import { toast } from 'sonner'
import { Attachment, UIMessage } from "ai"
import { useLocalStorage, useWindowSize } from 'usehooks-ts'
import { AttachmentsButton } from "../common/button-attach"
import { SendButton } from "../common/button-send"
import { supabase } from '@/app/lib/supabaseClient'
import { sendMessageToGemini } from "@/app/lib/gemini"
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { Button } from "../common/button"
import { useScrollToBottom } from "@/app/hooks/use-scroll-to-bottom"
import equal from "fast-deep-equal"
import { StopButton } from "../common/button-stop"
import { PreviewAttachment } from "../common/preview-attachment"
import { useSharedData } from "@/app/context/sharedDataContext"

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    attachments?: Array<Attachment>;
}

// Add base64 conversion helper:
const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });


export const uploadFileToSupabase = async (file: File) => {
    const filePath = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
        .from('uploads') // <- make sure this is your exact bucket name
        .upload(filePath, file, {
            upsert: false,
        });

    if (error) {
        console.error("Upload error:", error.message);
        throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);


    // get base64 for embedding in Gemini request
    const base64 = await fileToBase64(file);

    return {
        url: publicUrlData.publicUrl,
        name: file.name,
        contentType: file.type,
        base64,
    };
};


export async function saveChatSessionAndMessages({ email, userId, title, assistantResponse, attachedFiles, sessionId }: {
    email: string,
    userId: string,
    title: string,
    assistantResponse: string,
    sessionId?: string,
    attachedFiles?: Array<Attachment>,
}) {
    if (!sessionId) {
        const { data, error } = await supabase.from('sessions').insert({
            email,
            user_id: userId,
            created_at: new Date().toISOString(),
        }).select().single()
        if (error) throw error
        sessionId = data.id
    }
    const { error: messageError } = await supabase.from('messages').insert([
        {
            session_id: sessionId,
            role: 'assistant',
            content: assistantResponse,
            title,
            attachments: attachedFiles?.length
                ? attachedFiles.map(f => ({
                    url: f.url,
                    contentType: f.contentType,
                    name: f.name,
                }))
                : null,
            created_at: new Date().toISOString(),
        },
    ])
    if (messageError) throw messageError
    return sessionId
}

function PureMultimodalInput({ chatId, append, input, setInput, selectedVisibilityType, className, handleSubmit, status, messages, setMessages, sessionId, setSessionId, stop }: {
    chatId: string;
    append: UseChatHelpers['append'];
    selectedVisibilityType: VisibilityType;
    input: UseChatHelpers['input'];
    setInput: UseChatHelpers['setInput'];
    className?: string;
    handleSubmit: UseChatHelpers['handleSubmit'];
    status: UseChatHelpers['status'];
    messages: Array<UIMessage>;
    setMessages: UseChatHelpers['setMessages'];
    sessionId?: string;
    setSessionId: Dispatch<SetStateAction<string | undefined>>;
    stop: () => void;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { width } = useWindowSize();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
    const [user, setUser] = useState<any>(null);
    const [customStatus, setCustomStatus] = useState<'ready' | 'submitted'>('ready');
    const [localStorageInput, setLocalStorageInput] = useLocalStorage('input', '')
    const [attachedFiles, setAttachedFiles] = useState<Array<Attachment>>([]);
    const { attachments, setAttachments } = useSharedData();

    useEffect(() => {
        if (!input) setInput(localStorageInput || '')
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [])

    useEffect(() => {
        setLocalStorageInput(input);
    }, [input])

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
        }
    }

    const submitForm = useCallback(async () => {
        if (!input.trim()) return;
        window.history.replaceState({}, '', `/chat/${chatId}`);

        const userMessage: Message = {
            id: `${Date.now()}-user`,
            role: 'user',
            content: input,
        };
        setMessages([...messages, userMessage]);
        setCustomStatus('submitted');
        // handleSubmit(undefined, {
        //     experimental_attachments: attachments,
        // });
        setAttachments([]);
        setAttachedFiles([]);
        setInput('');
        setLocalStorageInput('');
        try {
            // Convert existing mess    ages to Gemini format
            const formattedMessages = messages.map((m) => ({
                role: m.role,
                parts: [{ text: m.content }] as ({ text: string } | { inlineData: { mimeType: string; data: string } })[]
            }))

            // Build parts array for current user message including images inline
            const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: input }];

            // Add images inline as base64 data to parts
            for (const file of attachments) {
                if (file.contentType?.startsWith('image/') && (file as any).base64) {
                    parts.push({
                        inlineData: {
                            mimeType: file.contentType,
                            data: (file as any).base64,
                        }
                    });
                }
            }

            formattedMessages.push({ role: 'user', parts });

            const response = await sendMessageToGemini(formattedMessages)
            console.log("LLLLLLLLLLLLLLLLLLLLL", response)
            const assistantMessage: Message = {
                id: `${Date.now()}-assistant`,
                role: 'assistant',
                content: response,
            }
            setMessages(prev => [...prev, assistantMessage])

            const title = input.slice(0, 40)
            const newSessionId = await saveChatSessionAndMessages({
                email: user.email,
                userId: user.id,
                title,
                assistantResponse: response,
                attachedFiles,
                sessionId,
            })
            setSessionId(newSessionId)
        } catch (err) {
            console.error(err)
            toast.error('Failed to submit message')
        } finally {
            setCustomStatus('ready')
        }
    }, [input, user, messages, chatId, attachments, setAttachments, handleSubmit])

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await uploadFileToSupabase(file);
            setAttachments((prev) => [...prev, result]);
            setAttachedFiles((prev) => [...prev, result]);
            console.log("File uploaded!", result);
        } catch (error) {
            console.error("File upload failed:", error);
        }
    }

    const { isAtBottom, scrollToBottom } = useScrollToBottom()

    useEffect(() => {
        console.log("vvvvvvvvvvvvvvv", attachments)
    }, [attachments.length])
    return (
        <div>
            <div className={`relative w-full flex flex-col gap-4 ${className}`}>
                <AnimatePresence>
                    {!isAtBottom && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
                        >
                            <Button
                                data-testid="scroll-to-bottom-button"
                                className="rounded-full border border-zinc-300"
                                size="icon"
                                variant="outline"
                                onClick={(event) => {
                                    event.preventDefault();
                                    scrollToBottom();
                                }}
                            >
                                <ArrowDown />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {attachments.length === 0 && messages.length === 0 && (
                    <SuggestedActions
                        chatId={chatId}
                        append={append}
                        selectedVisibilityType={selectedVisibilityType}
                        messages={messages}
                        setMessages={setMessages}
                        customStatus={customStatus}
                        setCustomStatus={setCustomStatus}
                        sessionId={sessionId}
                        setSessionId={setSessionId}
                    />
                )}

                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileChange}
                />

                {(attachedFiles.length > 0 || uploadQueue.length > 0) && (
                    <div className="flex gap-2 overflow-x-scroll">
                        {attachments.map(att => <PreviewAttachment key={att.url} attachment={att} />)}
                        {uploadQueue.map(name => <PreviewAttachment key={name} attachment={{ url: '', name, contentType: '' }} isUploading />)}
                    </div>
                )}

                <Textarea
                    ref={textareaRef}
                    placeholder="Send a message..."
                    value={input}
                    onChange={handleInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault()
                            if (status !== 'ready') toast.error('Please wait for the model response')
                            else submitForm()
                        }
                    }}
                    rows={2}
                    className={cx('min-h-[24px] max-h-[240px] resize-none rounded-2xl pb-10 bg-muted border-zinc-400', className)}
                />

                <div className="absolute bottom-0 left-0 p-2">
                    <AttachmentsButton fileInputRef={fileInputRef} status={status} />
                </div>
                <div className="absolute bottom-0 right-0 p-2">
                    {customStatus === 'submitted' ? <StopButton setMessages={setMessages} stop={stop} /> : (
                        <SendButton input={input} submitForm={submitForm} uploadQueue={uploadQueue} />
                    )}
                </div>
            </div>

            {messages.length > 0 && (
                <div className="flex justify-center">
                    <p className="text-sm text-zinc-400">ChatGPT can make mistakes. Check important info.</p>
                </div>
            )}
        </div>
    )
}

export const MultimodalInput = memo(PureMultimodalInput, (prev, next) => {
    return (
        prev.input === next.input &&
        prev.status === next.status &&
        prev.selectedVisibilityType === next.selectedVisibilityType &&
        prev.messages === next.messages &&
        equal(prev.sessionId, next.sessionId)
    )
})