'use client'
import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  Users,
  Mail,
  Trash2,
  Upload,
  UserCircle,
} from "lucide-react";

interface WorkspaceMember {
  id?: string;
  email: string;
  role: string;
  status: "active" | "pending";
  profileImage?: string;
  name?: string;
}

interface MemberManagementProps {
  members: WorkspaceMember[];
  onMemberAdd: (member: WorkspaceMember) => void;
  onMemberDelete: (memberId: string) => void;
  onMemberUpdate: (member: WorkspaceMember) => void;
}

export default function MemberManagement({
  members,
  onMemberAdd,
  onMemberDelete,
  onMemberUpdate,
}: MemberManagementProps) {
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState("member");
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInviteMember = () => {
    if (!newInviteEmail) return;

    const newMember: WorkspaceMember = {
      email: newInviteEmail,
      role: newInviteRole,
      status: "pending",
    };

    onMemberAdd(newMember);
    setNewInviteEmail("");
    setNewInviteRole("member");
  };

  const handleDeleteMember = (member: WorkspaceMember) => {
    setMemberToDelete(member);
  };

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      if (memberToDelete.id) {
        onMemberDelete(memberToDelete.id);
      }
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

    const updatedMember = members.find(m => m.id === memberId);
    if (updatedMember) {
      onMemberUpdate({ ...updatedMember, profileImage: imageUrl });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Members & Invitations</CardTitle>
            <CardDescription>
              Manage workspace members and send invitations
            </CardDescription>
          </div>
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
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
            {members.map((member) => (
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
                      onChange={(e) => member.id && handleProfileImageUpload(member.id, e)}
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
      </CardContent>
    </Card>
  );
}