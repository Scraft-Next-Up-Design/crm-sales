"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Phone,
  BarChart,
  Settings,
  Menu,
  X,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  logoSrc?: string;
  logoAlt?: string;
}

export function Sidebar({ 
  className, 
  logoSrc = "/logo.svg", 
  logoAlt = "Company Logo" 
}: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Leads Sources",
      icon: Users,
      href: "/leads-sources",
    },
    {
      label: "Leads",
      icon: Users,
      href: "/leads",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/messages",
    },
    {
      label: "Calls",
      icon: Phone,
      href: "/calls",
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40",
          "md:translate-x-0", // Always visible on medium and larger screens
          isOpen ? "translate-x-0" : "-translate-x-full", // Slide in/out on mobile
          className
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center py-4">
          <img 
            src={logoSrc} 
            alt={logoAlt} 
            className="h-12 w-auto max-w-48 object-contain" 
          />
        </div>

        {/* Navigation Routes */}
        <div className="space-y-4 py-4 px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start hover:bg-slate-100"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4 text-slate-600" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* User Profile Dropdown at Bottom */}
        <div className="absolute bottom-0 p-4 border-b flex items-center left-0 w-full border-t justify-between bg-slate-50 py-4 px-4">
          <div className="flex items-center space-x-3">
            <UserCircle className="h-10 w-10 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">John Doe</p>
              <p className="text-xs text-slate-500">Sales Manager</p>
            </div>
          </div>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className="h-4 w-4 text-slate-600 outline-none focus:outline-none" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}