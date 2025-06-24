'use client';

import React, { createContext, useContext, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Attachment } from 'ai';

type SharedDataContextType = {
    data: string;
    setData: (value: string) => void;
    currentSessionId: string | null;
    setCurrentSessionId: (id: string | null) => void;
    currentMessages: any[];
    setCurrentMessages: (messages: any[]) => void;
    attachments: Array<Attachment>;
    setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
    secondAttachments: Array<Attachment>;
    setSecondAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
};

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export const SharedDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState('initial shared data');
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentMessages, setCurrentMessages] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<Array<Attachment>>([]);
    const [secondAttachments, setSecondAttachments] = useState<Array<Attachment>>([]);

    useEffect(() => {
        console.log('66666666666666666666', attachments)
    }, [attachments])

    return (
        <SharedDataContext.Provider value={{ data, setData, currentSessionId, setCurrentSessionId, currentMessages, setCurrentMessages, attachments, setAttachments, secondAttachments, setSecondAttachments }}>
            {children}
        </SharedDataContext.Provider>
    );
};

export const useSharedData = () => {
    const context = useContext(SharedDataContext);
    if (!context) {
        throw new Error('useSharedData must be used within a SharedDataProvider');
    }
    return context;
};
