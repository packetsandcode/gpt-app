import {
    collection,
    doc,
    setDoc,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseClient";

export async function saveChatSessionAndMessages({
    email,
    userId,
    title,
    assistantResponse,
    sessionId,
}: {
    email: string;
    userId: string;
    title: string;                  // user's input
    assistantResponse: string;     // assistant's response
    sessionId?: string;
}) {
    let sessionRef;

    if (sessionId) {
        // Update existing session
        sessionRef = doc(db, "sessions", sessionId);
        await setDoc(
            sessionRef,
            { email, userId, updatedAt: serverTimestamp() },
            { merge: true }
        );
    } else {
        // Create new session
        sessionRef = await addDoc(collection(db, "sessions"), {
            email,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        sessionId = sessionRef.id;
    }

    // Save new assistant message only (with user input as title)
    const messagesCollection = collection(db, "sessions", sessionId, 'messages');

    await addDoc(messagesCollection, {
        role: 'assistant',
        title,                      // <- user input
        text: assistantResponse,    // <- assistant response
        createdAt: serverTimestamp(),
    });

    return sessionId;
}
