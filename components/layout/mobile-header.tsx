"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";

interface MobileHeaderProps {
  user: User | null;
  navigation: Array<{ name: string; href: string }>;
}

export function MobileHeader({ user, navigation }: MobileHeaderProps) {
  return (
    <div className="md:hidden lg:hidden flex h-16 items-center justify-between px-4">
      <Link href="/" className="font-bold text-xl">
        CRM
      </Link>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <MobileNav user={user} navigation={navigation} />
      </div>
    </div>
  );
}
