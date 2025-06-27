'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { supabase } from "@/app/lib/supabaseClient";
import "../index.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useAuth } from "@/app/context/authContext";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { user, login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Sign in using email and password
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (loginError) throw loginError

            // Optional: Require verified email (if email confirmation is enabled in Supabase)
            const user = data.user
            if (!user?.email_confirmed_at) {
                await supabase.auth.signOut()
                alert('Please verify your email before signing in.')
                return
            }

            // Optionally store session token
            const session = data.session
            if (session?.access_token) {
                // localStorage.setItem('supabase_token', session.access_token)
                login(session.access_token);
            }

            router.push('/');
            // Proceed to app/dashboard
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    useAuthGuard();

    return (
        <div className="w-100 min-h-screen flex justify-center items-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded shadow-md max-w-md w-full space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Sign In</h1>

                <label>User Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />

                <label>User Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    required
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />

                {error && <p className="text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/auth/signup')}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                    Create New Account
                </button>

            </form>
        </div>
    );
}
