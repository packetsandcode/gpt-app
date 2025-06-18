'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebaseClient";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          router.push('/'); // redirect to home/dashboard
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const resendVerificationEmail = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        alert("Verification email resent! Check your inbox.");
        setCanResend(false);
        setTimeout(() => setCanResend(true), 60000); // 1 min cooldown
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 text-center max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p className="mb-4">
        We've sent a verification email to your inbox. Please check your email and click the verification link.
      </p>

      <button
        onClick={resendVerificationEmail}
        disabled={!canResend || loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Sending..." : canResend ? "Resend Verification Email" : "Please wait to resend"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
