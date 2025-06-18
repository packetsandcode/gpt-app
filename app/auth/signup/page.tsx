'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebaseClient";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import "../index.css";

export default function SignUpPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update displayName with user's name
            await updateProfile(user, { displayName: name });

            // Send verification email
            await sendEmailVerification(user);

            alert("Verification email sent! Please check your inbox.");
            router.push('/auth/verify-email');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-100 min-h-screen flex justify-center items-center bg-gray-100">
            <form
                onSubmit={handleSignUp}
                className="bg-white p-8 rounded shadow-md max-w-md w-full space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>

                <label>User Name</label>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    required
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />

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
                    {loading ? "Creating Account..." : "Create Account"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                    Log In
                </button>
            </form>
        </div>
    );
}
