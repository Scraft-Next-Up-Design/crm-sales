"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNav } from "./mobile-nav";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Leads Sources", href: "/leads-sources" },
  { name: "Leads", href: "/leads" },
  { name: "Contact", href: "/contact" },
  { name: "Analytics", href: "/analytics" },
];

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="font-bold text-xl">
            CRM
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <MobileNav user={user} navigation={navigation} />
          </div>
        </div>
      </nav>

      <div className="h-16 md:h-0" />
    </>
  );
}
