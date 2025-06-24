import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export const useUserSessions = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error("Auth error or no user:", authError);
                setLoading(false);
                return;
            }

            try {
                const { data: sessionsData, error: sessionError } = await supabase
                    .from("sessions")
                    .select("id, user_id")
                    .eq("user_id", user.id);

                if (sessionError) {
                    console.error("Error fetching sessions:", sessionError);
                    setLoading(false);
                    return;
                }

                const sessionsWithMessages = await Promise.all(
                    (sessionsData || []).map(async (session) => {
                        const { data: messages, error: msgError } = await supabase
                            .from("messages")
                            .select("*")
                            .eq("session_id", session.id)
                            .order("created_at", { ascending: true });

                        if (msgError) {
                            console.error(`Error loading messages for session ${session.id}:`, msgError);
                            return {
                                ...session,
                                messages: [],
                            };
                        }

                        return {
                            ...session,
                            messages,
                        };
                    })
                );

                setSessions(sessionsWithMessages);
            } catch (error) {
                console.error("Error loading sessions and messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    useEffect(() => {
        console.log('Loaded sessions:', sessions);
    }, [sessions]);

    return { sessions, loading };
};
