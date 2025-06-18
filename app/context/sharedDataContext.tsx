'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type SharedDataContextType = {
    data: string;
    setData: (value: string) => void;
    currentSessionId: string | null;
    setCurrentSessionId: (id: string | null) => void;
    currentMessages: any[];
    setCurrentMessages: (messages: any[]) => void;
};

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export const SharedDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState('initial shared data');
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentMessages, setCurrentMessages] = useState<any[]>([]);

    useEffect(() => {
        console.log('66666666666666666666', currentMessages)
    }, [currentMessages])
    
    return (
        <SharedDataContext.Provider value={{ data, setData, currentSessionId, setCurrentSessionId, currentMessages, setCurrentMessages }}>
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
