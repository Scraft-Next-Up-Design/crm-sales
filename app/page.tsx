"use client";

import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const verifyLogin = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        console.log("No active session. Redirecting to login.");
        router.push("/login"); // Redirect to login if no session exists
      } else {
        router.push("/dashboard"); // Redirect to the dashboard if logged in
        console.log("User is logged in:", session.user);
      }
      console.log("session", session);
    };

    verifyLogin();
  }, []);
}
