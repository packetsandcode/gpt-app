'use client'

import { memo, useState, useEffect, useRef, useCallback, type Dispatch, type SetStateAction } from "react";
import type { UseChatHelpers } from '@ai-sdk/react';
import { SuggestedActions } from "./suggest";
import { VisibilityType } from "./header/visibility-selector";
import { Textarea } from "../common/textarea";
import cx from 'classnames';
import { toast } from 'sonner';
import { Attachment, UIMessage } from "ai";
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { AttachmentsButton } from "../common/button-attach";
import { SendButton } from "../common/button-send";
import {
    collection,
    doc,
    setDoc,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { sendMessageToOpenAI } from "@/app/lib/openai";
import { sendMessageToGemini } from "@/app/lib/gemini";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Button } from "../common/button";
import { useScrollToBottom } from "@/app/hooks/use-scroll-to-bottom";
import equal from "fast-deep-equal";
import { saveChatSessionAndMessages } from "@/app/lib/chatStorage";
import { StopButton } from "../common/button-stop";

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
};

function PureMultimodalInput({ chatId, append, input, setInput, selectedVisibilityType, className, handleSubmit, attachments, setAttachments, status, messages, setMessages, sessionId, setSessionId, stop }: {
    chatId: string;
    append: UseChatHelpers['append'];
    selectedVisibilityType: VisibilityType;
    input: UseChatHelpers['input'];
    setInput: UseChatHelpers['setInput'];
    className?: string;
    handleSubmit: UseChatHelpers['handleSubmit'];
    attachments: Array<Attachment>;
    setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
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
    // const [input, setInput] = useState('');
    const [user, setUser] = useState<any>(null);
    const [customStatus, setCustomStatus] = useState<'ready' | 'submitted'>('ready');

    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight();
        }
    }, []);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
        }
    };

    const [localStorageInput, setLocalStorageInput] = useLocalStorage(
        'input',
        '',
    );

    const resetHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = '98px';
        }
    };

    useEffect(() => {
        if (!input) {
            const finalValue = localStorageInput || '';
            setInput(finalValue);
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        setLocalStorageInput(input);
    }, [input, setLocalStorageInput]);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setInput(value);
        adjustHeight();
    };

    const submitForm = useCallback(async () => {
        console.log("eeeeeeeeeeeeee")
        if (!input.trim()) return;
        window.history.replaceState({}, '', `/chat/${chatId}`);

        const userMessage: Message = {
            id: `${Date.now()}-user`,
            role: 'user', // typed correctly as "user"
            content: input,
        };

        const optimisticMessages = [...messages, userMessage];
        setMessages(optimisticMessages);

        // handleSubmit(undefined, {
        //     experimental_attachments: attachments,
        // });
        setCustomStatus('submitted');

        setAttachments([]);
        setLocalStorageInput('');
        resetHeight();
        setInput('');

        if (width && width > 768) {
            textareaRef.current?.focus();
        }

        try {
            // await addDoc(collection(db, 'sessions'), {
            //     email: user.email,
            //     title: input,
            //     userId: user.uid,
            // });

            const formattedMessages = Array.isArray(messages)
                ? messages.map((m) => ({
                    role: m.role,
                    parts: [{ text: m.content }],
                }))
                : [];

            formattedMessages.push({
                role: "user",
                parts: [{ text: input }],
            });

            console.log("Formatted Data: ", formattedMessages);

            const response = await sendMessageToGemini(formattedMessages);
            console.log("Gemini response:", response);

            const assistantMessage: Message = {
                id: `${Date.now()}-assistant`,
                role: 'assistant',
                content: response,
            };

            console.log("111111111111111", assistantMessage)

            setMessages((prev) => [...prev, assistantMessage]);

            // Prepare chat messages array for Firestore saving (including latest user and assistant)
            const chatMessagesForFirestore = [
                {
                    role: 'assistant',
                    content: response,
                },
            ];
            console.log("eeeeeeeeeeeeeeeeeee", chatMessagesForFirestore);

            // Use first 40 chars of input as title
            const title = input.slice(0, 40);

            // Save session and messages to Firestore
            const newSessionId = await saveChatSessionAndMessages({
                email: user.email ?? "",
                userId: user.uid,
                title: input,                     // user input
                assistantResponse: response,      // assistant response
                sessionId: sessionId ?? undefined,
            });

            // Save sessionId in state for future appends
            setSessionId(newSessionId);
        } catch (error) {
            console.error("Error sending message: ", error);

        } finally {
            setCustomStatus('ready');
        }
        // addDoc(collection(db, 'sessions', "c1mQ421fJ4LTPE6TSunl", 'messages'), {
        //     role: 'user',
        //     messages: response
        // });

        console.log("ccccccccccc", input, user.uid, user.email)
    }, [
        attachments,
        // handleSubmit,
        setAttachments,
        setLocalStorageInput,
        width,
        chatId,
        input,
        user,
        setMessages,
        messages,
        sendMessageToGemini,
        sessionId,
    ]);

    useEffect(() => {
        console.log("rrrrrrrrrrrrrrrrrrrrrr", sessionId)
    }, [sessionId]);

    const { isAtBottom, scrollToBottom } = useScrollToBottom();

    useEffect(() => {
        console.log("123123123", messages)
    }, [messages])

    useEffect(() => {
        console.log("rrrrrrrrrrrrrrrr", status)
    }, [status])

    useEffect(() => {
        console.log("IIIIIIIIIIIIIIIIIIIII", customStatus)
    }, [customStatus])
    return (
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
            {messages.length === 0 &&
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
            }
            <Textarea
                data-testid="multimodal-input"
                ref={textareaRef}
                placeholder="Send a message..."
                value={input}
                onChange={handleInput}
                className={cx(
                    'min-h-[24px] max-h-[240px] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 border-t-4 border-transparent border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none',
                    className,
                )}
                rows={2}
                autoFocus
                onKeyDown={(event) => {
                    if (
                        event.key === 'Enter' &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                    ) {
                        event.preventDefault();

                        if (status !== 'ready') {
                            toast.error('Please wait for the model to finish its response!');
                        } else {
                            submitForm();
                        }
                    }
                }}
            />
            <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
                <AttachmentsButton
                    fileInputRef={fileInputRef}
                    status={status}
                />
            </div>
            <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
                {customStatus === "submitted" ? (
                    <StopButton setMessages={setMessages} stop={stop}></StopButton>
                ) : (
                    <SendButton
                        input={input}
                        submitForm={submitForm}
                        uploadQueue={uploadQueue}
                    />
                )}
            </div>
        </div>
    )
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.messages !== nextProps.messages) return false;
    if (!equal(prevProps.sessionId, nextProps.sessionId)) return false;
    return true;
});