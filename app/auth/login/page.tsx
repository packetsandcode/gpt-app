'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import "../index.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await user.reload(); // refresh info (e.g. emailVerified)
            if (!user.emailVerified) {
                alert("Please verify your email before signing in.");
                await auth.signOut();
                return;
            }

            const token = await user.getIdToken(); // <-- JWT token here

            localStorage.setItem("firebase_jwt", token);

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
