// "use client";
// import React, { useState, useRef } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   Building,
//   Users,
//   Settings,
//   Lock,
//   UserPlus,
//   Mail,
//   Trash2,
//   Upload,
//   UserCircle,
//   Info,
//   Bell,
//   CheckCircleIcon,
//   Pencil, Palette,
//   Plus
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";

// interface WorkspaceMember {
//   id: string;
//   email: string;
//   role: string;
//   status: "active" | "pending";
//   profileImage?: string;
//   name?: string;
// }

// interface WorkspaceSettings {
//   name: string;
//   industry: string;
//   size: string;
//   timezone: string;
//   notifications: {
//     email: boolean;
//     sms: boolean;
//     inApp: boolean;
//   };
//   security: {
//     twoFactor: boolean;
//     ipRestriction: boolean;
//   };
//   members: WorkspaceMember[];
// }
// export interface Status {
//   id: string;
//   label: string;
//   color: string;
//   showInWorkspace: boolean;
//   countInStats: boolean;
// }

// export default function WorkspaceSettingsPage() {
//   const [activeTab, setActiveTab] = useState("general");
//   const [settings, setSettings] = useState<WorkspaceSettings>({
//     name: "Acme Corporation",
//     industry: "Technology",
//     size: "51-200",
//     timezone: "America/New_York",
//     notifications: {
//       email: true,
//       sms: false,
//       inApp: true,
//     },
//     security: {
//       twoFactor: true,
//       ipRestriction: false,
//     },
//     members: [
//       {
//         id: "1",
//         email: "john@acme.com",
//         role: "admin",
//         status: "active",
//         name: "John Doe",
//         profileImage: "/api/placeholder/32/32",
//       },
//       {
//         id: "2",
//         email: "sarah@acme.com",
//         role: "member",
//         status: "active",
//         name: "Sarah Smith",
//         profileImage: "/api/placeholder/32/32",
//       },
//     ],
//   });
//   const colorOptions: string[] = [
//     'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'
//   ];
//   const [newInviteEmail, setNewInviteEmail] = useState("");
//   const [newInviteRole, setNewInviteRole] = useState("member");
//   const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(
//     null
//   );
//   const [statuses, setStatuses] = useState<Status[]>([
//     { id: "1", label: "Active", color: "bg-green-500", showInWorkspace: true, countInStats: true },
//     { id: "2", label: "Pending", color: "bg-yellow-500", showInWorkspace: true, countInStats: true },
//     { id: "3", label: "Inactive", color: "bg-red-500", showInWorkspace: false, countInStats: false },
//   ]);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [editingStatus, setEditingStatus] = useState<Status | null>(null);
//   const [newStatus, setNewStatus] = useState<Omit<Status, "id">>({
//     label: "",
//     color: "bg-gray-500",
//     showInWorkspace: true,
//     countInStats: true,
//   });
//   const handleInviteMember = () => {
//     if (!newInviteEmail) return;

//     const newMember: WorkspaceMember = {
//       id: Math.random().toString(36).substr(2, 9),
//       email: newInviteEmail,
//       role: newInviteRole,
//       status: "pending",
//     };

//     setSettings({
//       ...settings,
//       members: [...settings.members, newMember],
//     });

//     setNewInviteEmail("");
//     setNewInviteRole("member");
//   };

//   const handleDeleteMember = (member: WorkspaceMember) => {
//     setMemberToDelete(member);
//   };

//   const confirmDeleteMember = () => {
//     if (memberToDelete) {
//       setSettings({
//         ...settings,
//         members: settings.members.filter((m) => m.id !== memberToDelete.id),
//       });
//       setMemberToDelete(null);
//     }
//   };
//   const handleEditStatus = (status: Status): void => {
//     setEditingStatus(status);
//     setNewStatus(status);
//     setIsEditing(true);

//   };
//   const handleDeleteStatus = (id: string): void => {
//     setStatuses(statuses.filter(status => status.id !== id));
//   };
//   const handleDragEnd = (result: DropResult): void => {
//     if (!result.destination) return;

//     const items = Array.from(statuses);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);
//     setStatuses(items);
//   };

//   const handleSubmitStatus = (): void => {
//     if (isEditing && editingStatus) {
//       setStatuses(statuses.map(status => 
//         status.id === editingStatus.id ? { ...newStatus, id: status.id } : status
//       ));
//     } else {
//       setStatuses([...statuses, { ...newStatus, id: Date.now().toString() }]);
//     }
//     setIsEditing(false);
//     setEditingStatus(null);
//     setNewStatus({
//       label: '',
//       color: 'bg-gray-500',
//       showInWorkspace: true,
//       countInStats: true
//     });
//   };
//   const handleProfileImageUpload = async (
//     memberId: string,
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // In a real app, you would upload to your server here
//     // For demo, using placeholder
//     const imageUrl = "/api/placeholder/32/32";

//     setSettings({
//       ...settings,
//       members: settings.members.map((member) =>
//         member.id === memberId ? { ...member, profileImage: imageUrl } : member
//       ),
//     });

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       console.log("Settings saved:", settings);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const TabButton = ({
//     id,
//     icon: Icon,
//     label,
//   }: {
//     id: string;
//     icon: any;
//     label: string;
//   }) => (
//     <button
//       onClick={() => setActiveTab(id)}
//       className={cn(
//         "flex items-center space-x-2 px-4 py-2 rounded-lg w-full md:w-auto",
//         activeTab === id
//           ? "bg-primary text-primary-foreground"
//           : "hover:bg-secondary"
//       )}
//     >
//       <Icon className="w-5 h-5" />
//       <span>{label}</span>
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto p-4 md:p-6 space-y-6">
//         <div className="flex flex-col space-y-4">
//           <h1 className="text-2xl md:text-3xl font-bold">Workspace Settings</h1>

//           {/* Responsive Tab Navigation */}
//           <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto">
//             <TabButton id="general" icon={Building} label="General" />
//             <TabButton id="members" icon={Users} label="Members" />
//             <TabButton id="notifications" icon={Bell} label="Notifications" />
//             <TabButton id="security" icon={Lock} label="Security" />
//             <TabButton id="status" icon={CheckCircleIcon} label="Status" />

//           </div>
//         </div>

//         <div className="grid gap-6">
//           {/* General Settings */}
//           {activeTab === "general" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Basic Information</CardTitle>
//                 <CardDescription>
//                   Manage your workspace core details
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid gap-4">
//                   <div className="space-y-2">
//                     <Label>Workspace Name</Label>
//                     <Input
//                       value={settings.name}
//                       onChange={(e) =>
//                         setSettings({ ...settings, name: e.target.value })
//                       }
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Industry</Label>
//                     <Select
//                       value={settings.industry}
//                       onValueChange={(value) =>
//                         setSettings({ ...settings, industry: value })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select Industry" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Technology">Technology</SelectItem>
//                         <SelectItem value="Finance">Finance</SelectItem>
//                         <SelectItem value="Healthcare">Healthcare</SelectItem>
//                         <SelectItem value="Education">Education</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Company Size</Label>
//                     <Select
//                       value={settings.size}
//                       onValueChange={(value) =>
//                         setSettings({ ...settings, size: value })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select Size" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="1-50">1-50</SelectItem>
//                         <SelectItem value="51-200">51-200</SelectItem>
//                         <SelectItem value="201-500">201-500</SelectItem>
//                         <SelectItem value="500+">500+</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Timezone</Label>
//                     <Select
//                       value={settings.timezone}
//                       onValueChange={(value) =>
//                         setSettings({ ...settings, timezone: value })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select Timezone" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="America/New_York">
//                           Eastern Time (EST)
//                         </SelectItem>
//                         <SelectItem value="America/Chicago">
//                           Central Time (CST)
//                         </SelectItem>
//                         <SelectItem value="America/Denver">
//                           Mountain Time (MST)
//                         </SelectItem>
//                         <SelectItem value="America/Los_Angeles">
//                           Pacific Time (PST)
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Members Management */}
//           {activeTab === "members" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Members & Invitations</CardTitle>
//                 <CardDescription>
//                   Manage workspace members and send invitations
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Invite Form */}
//                 <div className="space-y-4">
//                   <Label>Invite New Member</Label>
//                   <div className="flex flex-col sm:flex-row gap-2">
//                     <Input
//                       type="email"
//                       placeholder="Email address"
//                       value={newInviteEmail}
//                       onChange={(e) => setNewInviteEmail(e.target.value)}
//                       className="flex-1"
//                     />
//                     <Select
//                       value={newInviteRole}
//                       onValueChange={setNewInviteRole}
//                     >
//                       <SelectTrigger className="w-full sm:w-[140px]">
//                         <SelectValue placeholder="Role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="admin">Admin</SelectItem>
//                         <SelectItem value="member">Member</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <Button
//                       onClick={handleInviteMember}
//                       className="w-full sm:w-auto"
//                     >
//                       <Mail className="mr-2 h-4 w-4" />
//                       Invite
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Members List */}
//                 <div className="space-y-4">
//                   <Label>Current Members & Pending Invites</Label>
//                   <div className="space-y-2">
//                     {settings.members.map((member) => (
//                       <div
//                         key={member.id}
//                         className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary rounded-lg gap-4"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div className="relative">
//                             {member.profileImage ? (
//                               <img
//                                 src={member.profileImage}
//                                 alt={member.name || member.email}
//                                 className="w-10 h-10 rounded-full object-cover"
//                               />
//                             ) : (
//                               <UserCircle className="w-10 h-10" />
//                             )}
//                             <input
//                               type="file"
//                               accept="image/*"
//                               className="hidden"
//                               ref={fileInputRef}
//                               onChange={(e) =>
//                                 handleProfileImageUpload(member.id, e)
//                               }
//                             />
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="absolute -bottom-1 -right-1 w-6 h-6 p-0 rounded-full bg-primary hover:bg-primary/90"
//                               onClick={() => fileInputRef.current?.click()}
//                             >
//                               <Upload className="w-3 h-3 text-white" />
//                             </Button>
//                           </div>
//                           <div>
//                             <p className="font-medium">
//                               {member.name || member.email}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {member.email}
//                             </p>
//                             <p className="text-sm text-muted-foreground capitalize">
//                               {member.role} • {member.status}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2 self-end sm:self-center">
//                           {member.status === "pending" && (
//                             <Button variant="outline" size="sm">
//                               Resend
//                             </Button>
//                           )}
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="text-destructive hover:text-destructive/90"
//                             onClick={() => handleDeleteMember(member)}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Notifications Settings */}
//           {activeTab === "notifications" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notification Preferences</CardTitle>
//                 <CardDescription>
//                   Configure how you receive updates
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="space-y-4">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
//                     <div className="space-y-0.5">
//                       <Label>Email Notifications</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Receive updates via email
//                       </p>
//                     </div>
//                     <Switch
//                       checked={settings.notifications.email}
//                       onCheckedChange={(checked) =>
//                         setSettings({
//                           ...settings,
//                           notifications: {
//                             ...settings.notifications,
//                             email: checked,
//                           },
//                         })
//                       }
//                     />
//                   </div>
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
//                     <div className="space-y-0.5">
//                       <Label>SMS Notifications</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Get updates via text message
//                       </p>
//                     </div>

//                     <Switch />
//                     <Switch
//                       checked={settings.notifications.sms}
//                       onCheckedChange={(checked) =>
//                         setSettings({
//                           ...settings,
//                           notifications: {
//                             ...settings.notifications,
//                             sms: checked,
//                           },
//                         })
//                       }
//                     />
//                   </div>
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
//                     <div className="space-y-0.5">
//                       <Label>In-App Notifications</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Show notifications in the application
//                       </p>
//                     </div>
//                     <Switch
//                       checked={settings.notifications.inApp}
//                       onCheckedChange={(checked) =>
//                         setSettings({
//                           ...settings,
//                           notifications: {
//                             ...settings.notifications,
//                             inApp: checked,
//                           },
//                         })
//                       }
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {activeTab === "status" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Status Management</CardTitle>
//                 <CardDescription>Manage custom statuses for your workspace</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex justify-end mb-6">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button variant="outline" className="flex items-center gap-2">
//                         <Plus className="w-4 h-4" />
//                         Add Status
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogHeader>
//                         <DialogTitle>{isEditing ? "Edit Status" : "Add New Status"}</DialogTitle>
//                       </DialogHeader>
//                       <div className="space-y-4 pt-4">
//                         <Input
//                           placeholder="Status Label"
//                           value={newStatus.label}
//                           onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
//                         />
//                         <div className="flex gap-2 flex-wrap">
//                           {colorOptions.map((color) => (
//                             <div
//                               key={color}
//                               className={`w-6 h-6 rounded cursor-pointer ${color} ${newStatus.color === color ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
//                               onClick={() => setNewStatus({ ...newStatus, color })}
//                             />
//                           ))}
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Checkbox
//                             id="workspace"
//                             checked={newStatus.showInWorkspace}
//                             onCheckedChange={(checked) =>
//                               setNewStatus({ ...newStatus, showInWorkspace: checked as boolean })
//                             }
//                           />
//                           <label htmlFor="workspace">Show in workspace</label>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Checkbox
//                             id="stats"
//                             checked={newStatus.countInStats}
//                             onCheckedChange={(checked) =>
//                               setNewStatus({ ...newStatus, countInStats: checked as boolean })
//                             }
//                           />
//                           <label htmlFor="stats">Count in statistics</label>
//                         </div>
//                         <Button onClick={handleSubmitStatus} className="w-full">
//                           {isEditing ? "Update Status" : "Add Status"}
//                         </Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 </div>

//                 <DragDropContext onDragEnd={handleDragEnd}>
//                   <Droppable droppableId="statuses">
//                     {(provided) => (
//                       <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
//                         {statuses.map((status, index) => (
//                           <Draggable key={status.id} draggableId={status.id} index={index}>
//                             {(provided) => (
//                               <div
//                                 ref={provided.innerRef}
//                                 {...provided.draggableProps}
//                                 {...provided.dragHandleProps}
//                                 className="bg-white p-4 rounded-lg shadow border flex items-center justify-between"
//                               >
//                                 <div className="flex items-center gap-4">
//                                   <Badge className={`${status.color} text-white`}>{status.label}</Badge>
//                                   <div className="flex gap-2 text-sm text-gray-500">
//                                     {status.showInWorkspace && <span>Workspace</span>}
//                                     {status.countInStats && <span>Statistics</span>}
//                                   </div>
//                                 </div>
//                                 <div className="flex gap-2">
//                                   <Button variant="ghost" size="icon" onClick={() => handleEditStatus(status)}>
//                                     <Pencil className="w-4 h-4" />
//                                   </Button>
//                                   <Button variant="ghost" size="icon" onClick={() => handleDeleteStatus(status.id)}>
//                                     <Trash2 className="w-4 h-4" />
//                                   </Button>
//                                 </div>
//                               </div>
//                             )}
//                           </Draggable>
//                         ))}
//                         {provided.placeholder}
//                       </div>
//                     )}
//                   </Droppable>
//                 </DragDropContext>
//               </CardContent>
//             </Card>)}
//           {/* Security Settings */}
//           {activeTab === "security" && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Security Settings</CardTitle>
//                 <CardDescription>
//                   Manage workspace security and authentication
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="space-y-4">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
//                     <div className="space-y-0.5">
//                       <Label>Two-Factor Authentication</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Require 2FA for all workspace members
//                       </p>
//                     </div>
//                     <Switch
//                       checked={settings.security.twoFactor}
//                       onCheckedChange={(checked) =>
//                         setSettings({
//                           ...settings,
//                           security: {
//                             ...settings.security,
//                             twoFactor: checked,
//                           },
//                         })
//                       }
//                     />
//                   </div>
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
//                     <div className="space-y-0.5">
//                       <Label>IP Address Restriction</Label>
//                       <p className="text-sm text-muted-foreground">
//                         Limit access to specific IP addresses
//                       </p>
//                     </div>
//                     <Switch
//                       checked={settings.security.ipRestriction}
//                       onCheckedChange={(checked) =>
//                         setSettings({
//                           ...settings,
//                           security: {
//                             ...settings.security,
//                             ipRestriction: checked,
//                           },
//                         })
//                       }
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Save Button */}
//         <div className="flex justify-end pt-6">
//           <Button
//             onClick={handleSave}
//             disabled={isSaving}
//             className="w-full sm:w-auto"
//           >
//             {isSaving ? "Saving..." : "Save Changes"}
//           </Button>
//         </div>
//       </div>

//       {/* Delete Member Confirmation Dialog */}
//       <AlertDialog
//         open={!!memberToDelete}
//         onOpenChange={() => setMemberToDelete(null)}
//       >
//         <AlertDialogContent className="sm:max-w-[425px]">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Member</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to remove{" "}
//               {memberToDelete?.name || memberToDelete?.email} from the
//               workspace? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className="sm:flex-row sm:justify-end gap-2">
//             <AlertDialogCancel className="sm:w-auto">Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDeleteMember}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

"use client"
import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Building,
  Users,
  Settings,
  Lock,
  UserPlus,
  Mail,
  Trash2,
  Upload,
  UserCircle,
  Info,
  Bell,
  CheckCircleIcon,
  Pencil,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface WorkspaceMember {
  id: string;
  email: string;
  role: string;
  status: "active" | "pending";
  profileImage?: string;
  name?: string;
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

interface Status {
  id: string;
  label: string;
  color: string;
  showInWorkspace: boolean;
  countInStats: boolean;
}

export default function WorkspaceSettingsPage() {
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

  const colorOptions = [
    { value: 'bg-red-500 dark:bg-red-600', label: 'Red' },
    { value: 'bg-green-500 dark:bg-green-600', label: 'Green' },
    { value: 'bg-blue-500 dark:bg-blue-600', label: 'Blue' },
    { value: 'bg-yellow-500 dark:bg-yellow-600', label: 'Yellow' },
    { value: 'bg-purple-500 dark:bg-purple-600', label: 'Purple' },
    { value: 'bg-pink-500 dark:bg-pink-600', label: 'Pink' },
    { value: 'bg-gray-500 dark:bg-gray-600', label: 'Gray' }
  ];

  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState("member");
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([
    { id: "1", label: "Active", color: "bg-green-500 dark:bg-green-600", showInWorkspace: true, countInStats: true },
    { id: "2", label: "Pending", color: "bg-yellow-500 dark:bg-yellow-600", showInWorkspace: true, countInStats: true },
    { id: "3", label: "Inactive", color: "bg-red-500 dark:bg-red-600", showInWorkspace: false, countInStats: false },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Omit<Status, "id">>({
    label: "",
    color: "bg-gray-500 dark:bg-gray-600",
    showInWorkspace: true,
    countInStats: true,
  });

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

  const handleEditStatus = (status: Status) => {
    setEditingStatus(status);
    setNewStatus({
      label: status.label,
      color: status.color,
      showInWorkspace: status.showInWorkspace,
      countInStats: status.countInStats,
    });
    setIsEditing(true);
    setIsStatusDialogOpen(true);
  };

  const handleDeleteStatus = (id: string) => {
    setStatuses(statuses.filter(status => status.id !== id));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(statuses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setStatuses(items);
  };

  const handleSubmitStatus = () => {
    if (isEditing && editingStatus) {
      setStatuses(statuses.map(status =>
        status.id === editingStatus.id
          ? { ...newStatus, id: status.id }
          : status
      ));
    } else {
      setStatuses([...statuses, { ...newStatus, id: Date.now().toString() }]);
    }

    setIsEditing(false);
    setEditingStatus(null);
    setNewStatus({
      label: '',
      color: 'bg-gray-500 dark:bg-gray-600',
      showInWorkspace: true,
      countInStats: true
    });
    setIsStatusDialogOpen(false);
  };

  const handleProfileImageUpload = async (
    memberId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
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

  const StatusDialog = () => (
    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Status" : "Add New Status"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Status Label</Label>
            <Input
              placeholder="Enter status label"
              value={newStatus.label}
              onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    "w-full h-8 rounded-md transition-all",
                    color.value,
                    newStatus.color === color.value
                      ? "ring-2 ring-offset-2 ring-offset-background ring-ring"
                      : "hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-ring/50"
                  )}
                  onClick={() => setNewStatus({ ...newStatus, color: color.value })}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workspace"
                checked={newStatus.showInWorkspace}
                onCheckedChange={(checked) =>
                  setNewStatus({ ...newStatus, showInWorkspace: checked as boolean })
                }
              />
              <Label htmlFor="workspace">Show in workspace</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stats"
                checked={newStatus.countInStats}
                onCheckedChange={(checked) =>
                  setNewStatus({ ...newStatus, countInStats: checked as boolean })
                }
              />
              <Label htmlFor="stats">Count in statistics</Label>
            </div>
          </div>

          <Button onClick={handleSubmitStatus} className="w-full">
            {isEditing ? "Update Status" : "Add Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const StatusCard = ({ status, index }: { status: Status; index: number }) => (
    <Draggable draggableId={status.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-card p-4 rounded-lg shadow-sm border flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Badge className={cn(status.color, "text-white")}>
              {status.label}
            </Badge>
            <div className="flex gap-2 text-sm text-muted-foreground">
              {status.showInWorkspace && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Workspace
                </span>
              )}
              {status.countInStats && (
                <span className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  Statistics
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditStatus(status)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteStatus(status.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold">Workspace Settings</h1>

          <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto">
            <TabButton id="general" icon={Building} label="General" />
            <TabButton id="members" icon={Users} label="Members" />
            <TabButton id="notifications" icon={Bell} label="Notifications" />
            <TabButton id="security" icon={Lock} label="Security" />
            <TabButton id="status" icon={CheckCircleIcon} label="Status" />
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

          {/* Status Management */}
          {activeTab === "status" && (
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
                <CardDescription>Manage custom statuses for your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-6">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingStatus(null);
                      setNewStatus({
                        label: '',
                        color: 'bg-gray-500 dark:bg-gray-600',
                        showInWorkspace: true,
                        countInStats: true
                      });
                      setIsStatusDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Status
                  </Button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="statuses">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {statuses.map((status, index) => (
                          <StatusCard key={status.id} status={status} index={index} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <StatusDialog />
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
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
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
    </div>
  );
}