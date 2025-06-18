import { useEffect, useState } from "react";
import { db, auth } from "@/app/lib/firebaseClient";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useUserSessions = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const sessionQuery = query(
                        collection(db, "sessions"),
                        where("email", "==", user.email)
                    );
                    const sessionSnapshot = await getDocs(sessionQuery);

                    const sessionPromises = sessionSnapshot.docs.map(async (sessionDoc) => {
                        const sessionId = sessionDoc.id;
                        const sessionData = sessionDoc.data();

                        const messagesQuery = query(
                            collection(db, "sessions", sessionId, "messages"),
                            orderBy("createdAt", "asc")
                        );
                        const messagesSnapshot = await getDocs(messagesQuery);

                        const messages = messagesSnapshot.docs.map((msgDoc) => ({
                            id: msgDoc.id,
                            ...msgDoc.data(),
                        }));

                        return {
                            id: sessionId,
                            ...sessionData,
                            messages,
                        };
                    });

                    const sessionsWithMessages = await Promise.all(sessionPromises);
                    setSessions(sessionsWithMessages);
                } catch (error) {
                    console.error("Error loading sessions and messages:", error);
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        console.log('pppppppppppppppp', sessions)
    }, [sessions])
    
    return { sessions, loading };
};
