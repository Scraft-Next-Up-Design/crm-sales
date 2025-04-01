"use client";

import dynamic from "next/dynamic";
import { SidebarSkeleton } from "./sidebar-skeleton";

// Dynamic imports for layout components with skeleton loading states
export const DynamicSidebar = dynamic(
  () => import("./sidebar").then((mod) => ({ default: mod.Sidebar })),
  { loading: () => <SidebarSkeleton />, ssr: false }
);

export const DynamicNavbar = dynamic(
  () => import("./navbar").then((mod) => ({ default: mod.Navbar })),
  { loading: () => <SidebarSkeleton />, ssr: false }
);

export const DynamicUserNav = dynamic(
  () => import("./user-nav").then((mod) => ({ default: mod.UserNav })),
  { loading: () => <SidebarSkeleton />, ssr: false }
);