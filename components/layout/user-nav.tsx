"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logout } from "@/lib/store/slices/authSlice";
import Link from "next/link";
import { memo } from "react";

// Create a memoized AvatarContent component to prevent unnecessary re-renders
const AvatarContent = memo(({ src, email }: { src: string; email?: string }) => (
  <Avatar className="h-8 w-8">
    {src ? (
      <div className="relative h-full w-full overflow-hidden rounded-full">
        <OptimizedImage
          src={src}
          alt={email || "User avatar"}
          fill
          sizes="32px"
          className="object-cover"
          priority={true}
          quality={90}
          fallbackSrc="/avatars/default.png"
        />
      </div>
    ) : (
      <AvatarFallback>
        {email ? email.charAt(0).toUpperCase() : "U"}
      </AvatarFallback>
    )}
  </Avatar>
));
AvatarContent.displayName = "AvatarContent";

export function UserNav() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  // Safely determine avatar source
  const avatarSrc = user?.avatarUrl || "/avatars/01.png";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <AvatarContent src={avatarSrc} email={user?.email} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.role || "User"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={() => dispatch(logout())}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
