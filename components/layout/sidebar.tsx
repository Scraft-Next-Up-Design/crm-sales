"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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
  Contact,
  Bell,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
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
  DialogDescription,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { useCreateWorkspaceMutation, useGetWorkspacesByOwnerIdQuery, useGetWorkspacesQuery, useUpdateWorkspaceStatusMutation } from "@/lib/store/services/workspace";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGetLeadsByWorkspaceQuery } from "@/lib/store/services/leadsApi";
import { useParams } from "next/navigation";
import { ThemeToggle } from "../theme-toggle";
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  logoSrc?: string;
  logoAlt?: string;
}

interface Workspace {
  id: string;
  name: string;
  role: string;
  industry?: string;
  status?: boolean;
  type?: string;
}

export function Sidebar({
  className,
  logoSrc = "/logo.svg",
  logoAlt = "Company Logo",
}: SidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [updateWorkspaceStatus] = useUpdateWorkspaceStatusMutation();
  const { data: workspacesData, isLoading, isError, isFetching, refetch } = useGetWorkspacesQuery();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [createWorkspace] = useCreateWorkspaceMutation();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(workspacesData?.data || []);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0] || []);
  const { data: workspaceData }: any = useGetLeadsByWorkspaceQuery({ workspaceId: selectedWorkspace.id });
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    industry: "",
    type: "sales",
    companySize: "",
    companyType: "",
    timezone: "",
    notifications: {
      email: true,
      sms: true,
      inApp: true,
    },
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(
    null
  );
  // Mock total leads count
  const totalLeads = workspaceData?.data?.length || "NA";
  console.log(params)
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
      badge: totalLeads,
    },
    {
      label: "Contact",
      icon: MessageSquare,
      href: "/contact",
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
    },
    // {
    //   label: "Setting",
    //   icon: Settings,
    //   href: "/setting",
    // },
  ];
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("logout completed");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) setUser(data.user);
      if (error) toast.error("Error fetching user data:", error.message as any);
    };
    fetchUser();
  }, []);
  const handleAddWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newWorkspace.name.trim()) {
      const newWorkspaceItem = {
        id: (workspaces.length + 1).toString(),
        name: newWorkspace.name,
        role: 'Admin',
      };

      try {
        await createWorkspace({
          name: newWorkspace.name,
          status: true,
          companyType: newWorkspace.companyType,
          companySize: newWorkspace.companySize,
          industry: newWorkspace.industry,
          type: newWorkspace.type,
          timezone: newWorkspace.timezone,
          notifications: newWorkspace.notifications,
        }).unwrap();
        refetch();
        setWorkspaces([...workspaces, newWorkspaceItem]);
        setSelectedWorkspace(newWorkspaceItem);

        // Reset newWorkspace state
        setNewWorkspace({
          name: '',
          industry: '',
          type: 'sales',
          companySize: '',
          companyType: '',
          timezone: '',
          notifications: {
            email: true,
            sms: true,
            inApp: true,
          },
        });
        setDialogOpen(false);

      } catch (error: any) {
        toast.error(error.data.error);
      }
    }
  };
  const handleEditWorkspace = (workspace: Workspace) => {
    console.log(workspace.name)
    router.push(`/workspace/${workspace.id}`);

  }
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) setUser(data.user?.user_metadata);
      if (error) console.error("Error fetching user data:", error);
    };
    fetchUser();
  }, []);
  // const confirmDeleteWorkspace = () => {
  //   if (workspaceToDelete) {
  //     const updatedWorkspaces = workspaces.filter(
  //       (w) => w.id !== workspaceToDelete.id
  //     );
  //     setWorkspaces(updatedWorkspaces);
  //     if (selectedWorkspace.id === workspaceToDelete.id) {
  //       setSelectedWorkspace(updatedWorkspaces[0]);
  //     }
  //   }
  //   setIsDeleteDialogOpen(false);
  //   setWorkspaceToDelete(null);
  // };
  useEffect(() => {
    if (workspacesData?.data) {
      setWorkspaces(workspacesData.data);
      const activeWorkspace = workspacesData.data.find((workspace: Workspace) => workspace.status === true);
      if (activeWorkspace) {
        setSelectedWorkspace(activeWorkspace);
      } else if (workspacesData.data.length > 0) {
        const fallbackWorkspace = workspacesData.data[0];
        setSelectedWorkspace(fallbackWorkspace);
      }
    }
  }, [workspacesData?.data]);
  const handleWorkspaceChange = async (workspaceId: string) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (!workspace) return;

      await updateWorkspaceStatus({ id: workspaceId, status: true });
      setSelectedWorkspace(workspace);
      refetch();

      if (window.location.href.includes('workspace')) {
        router.push(`/workspace/${workspaceId}`);
      }
      else {
        router.push(`/dashboard`);
      }
      // Ensure the page reloads after navigation or by default
      window.location.reload();
    } catch (error) {
      console.error("Failed to change workspace:", error);
    }
  };
  return (
    <>
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
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
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
          <Select value={selectedWorkspace.id} onValueChange={handleWorkspaceChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Workspace">
                <div className="flex items-center">
                  <Folder className="mr-2 h-4 w-4" />
                  {selectedWorkspace.name}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {workspaces?.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id} className="cursor-pointer">
                  <div className="grid grid-cols-[1fr,auto,auto] items-center w-full gap-2">
                    <div className="flex items-center min-w-0">
                      <Folder className="shrink-0 mr-2 h-4 w-4" />
                      <span className="truncate">{workspace.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-20 absolute right-0 ml-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditWorkspace(workspace);
                      }}
                    >
                      <Settings className="h-4 w-4 text-slate-500 hover:text-slate-800 ml-30" />
                    </Button>
                  </div>
                </SelectItem>
              ))}
              {/* Add Workspace Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
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
                    <div>
                      <Label htmlFor="companySize">Company Size</Label>
                      <Input
                        id="companySize"
                        value={newWorkspace.companySize}
                        onChange={(e) =>
                          setNewWorkspace({
                            ...newWorkspace,
                            companySize: e.target.value,
                          })
                        }
                        placeholder="Enter company size (e.g., 10-50, 50-100)"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyType">Company Type</Label>
                      <Select
                        value={newWorkspace.companyType}
                        onValueChange={(value) =>
                          setNewWorkspace({
                            ...newWorkspace,
                            companyType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="agency">Agency</SelectItem>
                          <SelectItem value="nonprofit">Nonprofit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={newWorkspace.industry}
                        onValueChange={(value) =>
                          setNewWorkspace({
                            ...newWorkspace,
                            industry: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
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

        {/* Rest of the component remains the same */}
        {/* Navigation Routes */}
        <div className="space-y-4 py-4 px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white dark:hover:text-white relative"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-300" />
                  {route.label}
                  {route.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-blue-100 text-blue-800"
                    >
                      {route.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="absolute bottom-0 p-4 border-b flex items-center left-0 w-full border-t justify-between bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
          {user ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              {/* User Image - Modified for full rounded appearance */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={
                    user?.image ||
                    "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                  alt={`${user?.name || "User"}'s profile`}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>

              {/* User Information */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {user?.name || user.firstName + " " + user.lastName || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || "Email not available"}
                </p>
              </div>
              <ThemeToggle />
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading user data...
            </p>
          )}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="outline-none focus:outline-none cursor-pointer">
              <Button variant="ghost" size="icon">
                <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300 outline-none focus:outline-none" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 dark:bg-slate-800 dark:text-white dark:border-slate-700"
            >
              {/* <Link href="/profile">
                <DropdownMenuItem className="dark:hover:bg-slate-700 cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link> */}
              <Link href="/profile">
                <DropdownMenuItem className="dark:hover:bg-slate-700 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 dark:hover:bg-slate-700 cursor-pointer"
                onClick={handleLogout} // Attach logout function here
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div >

      {/* Delete Confirmation Dialog */}
      {/* < Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workspaceToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteWorkspace}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Mobile Overlay */}
      {
        isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )
      }
    </>
  );
}
