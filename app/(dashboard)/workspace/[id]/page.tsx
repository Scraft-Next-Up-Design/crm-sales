'use client'
import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building,
  Users,
  Lock,
  Mail,
  Trash2,
  Upload,
  UserCircle,
  Bell,
  Tag,
  Edit2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAddStatusMutation, useGetStatusQuery } from "@/lib/store/services/status";

interface WorkspaceMember {
  id: string;
  email: string;
  role: string;
  status: "active" | "pending";
  profileImage?: string;
  name?: string;
}

interface Status {
  id: string;
  name: string;
  color: string;
  count_statistics: boolean;
  workspace_show: boolean;
}

interface WorkspaceSettings {
  name: string;
  industry: string;
  size: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  security: {
    twoFactor: boolean;
    ipRestriction: boolean;
  };
  members: WorkspaceMember[];
}

// Status Form Component
const StatusForm = ({ status, onSubmit }: any) => (
  <div className="grid gap-4">
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Status name"
        value={status.name}
        onChange={(e) =>
          onSubmit({ ...status, name: e.target.value })
        }
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <Label htmlFor="color" className="whitespace-nowrap">Pick Color:</Label>
        <Input
          id="color"
          type="color"
          value={status.color}
          onChange={(e) =>
            onSubmit({ ...status, color: e.target.value })
          }
          className="w-20 h-10 p-1 bg-transparent"
        />
      </div>
    </div>
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="countInStatistics"
          checked={status.countInStatistics}
          onCheckedChange={(checked) =>
            onSubmit({
              ...status,
              countInStatistics: checked as boolean,
            })
          }
        />
        <Label htmlFor="countInStatistics">Count in statistics</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showInWorkspace"
          checked={status.showInWorkspace}
          onCheckedChange={(checked) =>
            onSubmit({
              ...status,
              showInWorkspace: checked as boolean,
            })
          }
        />
        <Label htmlFor="showInWorkspace">Show in workspace</Label>
      </div>
    </div>
  </div>
);

export default function WorkspaceSettingsPage() {
  const [addStatus] = useAddStatusMutation();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<WorkspaceSettings>({
    name: "Acme Corporation",
    industry: "Technology",
    size: "51-200",
    timezone: "America/New_York",
    notifications: {
      email: true,
      sms: false,
      inApp: true,
    },
    security: {
      twoFactor: true,
      ipRestriction: false,
    },
    members: [
      {
        id: "1",
        email: "john@acme.com",
        role: "admin",
        status: "active",
        name: "John Doe",
        profileImage: "/api/placeholder/32/32",
      },
      {
        id: "2",
        email: "sarah@acme.com",
        role: "member",
        status: "active",
        name: "Sarah Smith",
        profileImage: "/api/placeholder/32/32",
      },
    ],

  });
  const searchParams = useParams();
  const { id: workspaceId }: any = searchParams
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState("member");
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { data: statusData, isLoading: isLoadingStatus }: any = useGetStatusQuery(workspaceId);

  // Status Management States
  const [newStatus, setNewStatus] = useState({
    name: "",
    color: "#0ea5e9",
    countInStatistics: true,
    showInWorkspace: true,
  });
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);
  const [statusToEdit, setStatusToEdit] = useState<Status | null>(null);
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  const handleInviteMember = () => {
    if (!newInviteEmail) return;

    const newMember: WorkspaceMember = {
      id: Math.random().toString(36).substr(2, 9),
      email: newInviteEmail,
      role: newInviteRole,
      status: "pending",
    };

    setSettings({
      ...settings,
      members: [...settings.members, newMember],
    });

    setNewInviteEmail("");
    setNewInviteRole("member");
  };

  const handleDeleteMember = (member: WorkspaceMember) => {
    setMemberToDelete(member);
  };

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      setSettings({
        ...settings,
        members: settings.members.filter((m) => m.id !== memberToDelete.id),
      });
      setMemberToDelete(null);
    }
  };

  const handleProfileImageUpload = async (
    memberId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload to your server here
    const imageUrl = "/api/placeholder/32/32";

    setSettings({
      ...settings,
      members: settings.members.map((member) =>
        member.id === memberId ? { ...member, profileImage: imageUrl } : member
      ),
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Status Management Functions
  const handleAddStatus = async () => {
    if (!newStatus.name) return;
    const status: any = {
      id: "",
      ...newStatus,
    };
    const response = await addStatus({ statusData: status, workspaceId })
    console.log(response);
    console.log(status);
    setNewStatus({
      name: "",
      color: "#0ea5e9",
      countInStatistics: false,
      showInWorkspace: false,
    });
    setIsAddingStatus(false);
  };

  const handleEditStatus = (status: Status) => {
    setStatusToEdit({ ...status });
  };

  const handleUpdateStatus = () => {
    if (!statusToEdit) return;

    const updatedStatus = statusData?.data.map((status: Status) =>
      status.id === statusToEdit.id ? statusToEdit : status
    );

    setSettings({
      ...statusData?.data,
      updatedStatus,
    });
    console.log(updatedStatus)
    setStatusToEdit(null);
  };

  const confirmDeleteStatus = () => {
    if (statusToDelete) {
      const updatedStatus = statusData?.data.filter(
        (s: Status) => s.id !== statusToDelete.id
      );

      setSettings({
        ...statusData?.data,
        updatedStatus,
      });
      setStatusToDelete(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  const TabButton = ({
    id,
    icon: Icon,
    label,
  }: {
    id: string;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg w-full md:w-auto",
        activeTab === id
          ? "bg-primary text-primary-foreground"
          : "hover:bg-secondary"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
  console.log(statusData.data)
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold">Workspace Settings</h1>

          {/* Responsive Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto">
            <TabButton id="general" icon={Building} label="General" />
            <TabButton id="members" icon={Users} label="Members" />
            <TabButton id="notifications" icon={Bell} label="Notifications" />
            <TabButton id="security" icon={Lock} label="Security" />
            <TabButton id="status" icon={Tag} label="Status" />
          </div>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Manage your workspace core details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <Input
                      value={settings.name}
                      onChange={(e) =>
                        setSettings({ ...settings, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={settings.industry}
                      onValueChange={(value) =>
                        setSettings({ ...settings, industry: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select
                      value={settings.size}
                      onValueChange={(value) =>
                        setSettings({ ...settings, size: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) =>
                        setSettings({ ...settings, timezone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">
                          Eastern Time (EST)
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time (CST)
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time (MST)
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time (PST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members Management */}
          {activeTab === "members" && (
            <Card>
              <CardHeader>
                <CardTitle>Members & Invitations</CardTitle>
                <CardDescription>
                  Manage workspace members and send invitations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Invite Form */}
                <div className="space-y-4">
                  <Label>Invite New Member</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={newInviteRole}
                      onValueChange={setNewInviteRole}
                    >
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleInviteMember}
                      className="w-full sm:w-auto"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Invite
                    </Button>
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-4">
                  <Label>Current Members & Pending Invites</Label>
                  <div className="space-y-2">
                    {settings.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary rounded-lg gap-4"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {member.profileImage ? (
                              <img
                                src={member.profileImage}
                                alt={member.name || member.email}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <UserCircle className="w-10 h-10" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={(e) =>
                                handleProfileImageUpload(member.id, e)
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -bottom-1 -right-1 w-6 h-6 p-0 rounded-full bg-primary hover:bg-primary/90"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-3 h-3 text-white" />
                            </Button>
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.name || member.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {member.role} • {member.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {member.status === "pending" && (
                            <Button variant="outline" size="sm">
                              Resend
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            email: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get updates via text message
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            sms: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
                    <div className="space-y-0.5">
                      <Label>In-App Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications in the application
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.inApp}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            inApp: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage workspace security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all workspace members
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactor}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            twoFactor: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
                    <div className="space-y-0.5">
                      <Label>IP Address Restriction</Label>
                      <p className="text-sm text-muted-foreground">
                        Limit access to specific IP addresses
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.ipRestriction}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            ipRestriction: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Management */}
          <div>
            {activeTab === "status" && (
              <Card>
                <CardHeader>
                  <CardTitle>Status Management</CardTitle>
                  <CardDescription>
                    Create and manage status options for your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Status Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setIsAddingStatus(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Status
                    </Button>
                  </div>

                  {/* Status List */}
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {statusData?.data?.map((status: Status) => (
                        <div
                          key={status.id}
                          className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-secondary rounded-lg"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="relative"
                                style={{ display: 'inline-flex', alignItems: 'center' }}
                              >
                                <div
                                  className="w-3 h-3 rounded-full absolute"
                                  style={{
                                    backgroundColor: status.color,
                                    filter: `blur(4px)`,
                                    opacity: 0.7,
                                  }}
                                />
                                <div
                                  className="w-3 h-3 rounded-full relative"
                                  style={{
                                    backgroundColor: status.color,
                                  }}
                                />
                              </div>
                              <span className="text-foreground text-gray-600">{status.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap justify-end">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={status.count_statistics}
                                disabled
                              />
                              <Label className="text-sm">Count in statistics</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={status.workspace_show}
                                disabled
                              />
                              <Label className="text-sm">Show in workspace</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditStatus(status)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90"
                                onClick={() => setStatusToDelete(status)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Save Button */}
        {activeTab !== "status" && (
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
      {/* Delete Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={() => setMemberToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              {memberToDelete?.name || memberToDelete?.email} from the
              workspace? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel className="sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Status Dialog */}
      <Dialog open={isAddingStatus} onOpenChange={setIsAddingStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Status</DialogTitle>
            <DialogDescription>
              Create a new status for your workspace
            </DialogDescription>
          </DialogHeader>
          <StatusForm
            status={newStatus}
            onSubmit={setNewStatus}
          // onCancel={() => setIsAddingStatus(false)}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddingStatus(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStatus}>Add Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog
        open={!!statusToEdit}
        onOpenChange={(open) => !open && setStatusToEdit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status</DialogTitle>
            <DialogDescription>
              Modify the status settings
            </DialogDescription>
          </DialogHeader>
          {statusToEdit && (
            <>
              <StatusForm
                status={statusToEdit}
                onSubmit={setStatusToEdit}
              // onCancel={() => setStatusToEdit(null)}
              />
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStatusToEdit(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Status Confirmation Dialog */}
      <AlertDialog
        open={!!statusToDelete}
        onOpenChange={() => setStatusToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the status &quot;{statusToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStatus}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}