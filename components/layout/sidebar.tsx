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
  Plus,
  Podcast,
  SquareCode,
  Folder,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  logoSrc?: string;
  logoAlt?: string;
}

export function Sidebar({
  className,
  logoSrc = "/logo.svg",
  logoAlt = "Company Logo",
}: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([
    { id: "1", name: "Sales Team", role: "Admin" },
    { id: "2", name: "Marketing Team", role: "Member" },
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    type: "sales",
  });

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
      icon: SquareCode,
      href: "/leads",
    },
    // {
    //   label: "Audience",
    //   icon: Podcast,
    //   href: "/audience",
    // },
    // {
    //   label: "Calls",
    //   icon: Phone,
    //   href: "/calls",
    // },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
    },
    {
      label: "Setting",
      icon: Settings,
      href: "/setting",
    },
  ];

  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspace.name.trim()) {
      const newWorkspaceItem = {
        id: (workspaces.length + 1).toString(),
        name: newWorkspace.name,
        role: "Admin",
      };
      setWorkspaces([...workspaces, newWorkspaceItem]);
      setSelectedWorkspace(newWorkspaceItem);
      setNewWorkspace({ name: "", type: "sales" });
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-slate-900 dark:text-white dark:border-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 dark:text-white shadow-lg transform transition-transform duration-300 ease-in-out z-40",
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

        {/* Workspace Selector */}
        <div className="px-4 mb-4">
          <Select
            value={selectedWorkspace.id}
            onValueChange={(value) => {
              const workspace = workspaces.find((w) => w.id === value);
              if (workspace) setSelectedWorkspace(workspace);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Workspace">
                <div className="flex items-center">
                  <Folder className="mr-2 h-4 w-4" />
                  {selectedWorkspace.name}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  <div className="flex items-center">
                    <Folder className="mr-2 h-4 w-4" />
                    {workspace.name}
                    <span className="text-xs text-slate-500 ml-2">
                      ({workspace.role})
                    </span>
                  </div>
                </SelectItem>
              ))}

              {/* Add Workspace Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Workspace
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddWorkspace} className="space-y-4">
                    <div>
                      <Label htmlFor="workspaceName">Workspace Name</Label>
                      <Input
                        id="workspaceName"
                        value={newWorkspace.name}
                        onChange={(e) =>
                          setNewWorkspace({
                            ...newWorkspace,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter workspace name"
                        required
                      />
                    </div>
                    <div>
                      <Label>Workspace Type</Label>
                      <Select
                        value={newWorkspace.type}
                        onValueChange={(value) =>
                          setNewWorkspace({
                            ...newWorkspace,
                            type: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select workspace type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Create Workspace
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation Routes */}
        <div className="space-y-4 py-4 px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white dark:hover:text-white"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-300" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* User Profile Dropdown at Bottom */}
        <div className="absolute bottom-0 p-4 border-b flex items-center left-0 w-full border-t justify-between bg-slate-50 dark:bg-slate-800 dark:border-slate-700 py-4 px-4">
          <div className="flex items-center space-x-3">
            <UserCircle className="h-10 w-10 text-slate-600 dark:text-slate-300" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                John Doe
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sales Manager
              </p>
            </div>
          </div>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300 outline-none focus:outline-none" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 dark:bg-slate-800 dark:text-white dark:border-slate-700"
            >
              <Link href={"/profile"}>
                <DropdownMenuItem className="dark:hover:bg-slate-700">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="dark:hover:bg-slate-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400 dark:hover:bg-slate-700">
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
