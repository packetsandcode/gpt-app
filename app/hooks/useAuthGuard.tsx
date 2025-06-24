// hooks/useAuthGuard.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("supabase_token");
    console.log("ssssssssssssssss", token)
    if (!token) {
      router.push("/auth/login"); // redirect if not logged in
    } else {
      router.push("/");
    }
  }, [router]);
}
