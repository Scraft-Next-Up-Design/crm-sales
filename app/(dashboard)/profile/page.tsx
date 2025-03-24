"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CRM_MESSAGES } from "@/lib/constant/crm";
import { RootState } from "@/lib/store/store";
import { supabase } from "@/lib/supabaseClient";
import {
  Briefcase,
  Calendar,
  Loader2,
  Mail,
  Phone,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface ProfileDetails {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    dateOfBirth: string;
  };
  professionalInfo: {
    title: string;
    department: string;
    company: string;
    startDate: string;
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

function EditProfileDialog({
  profileData,
  onProfileUpdate,
  open,
  onOpenChange,
}: {
  profileData: ProfileDetails;
  onProfileUpdate: (data: any) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    firstName: profileData.personalInfo.firstName,
    lastName: profileData.personalInfo.lastName,
    phone: profileData.personalInfo.phone,
    dateOfBirth: profileData.personalInfo.dateOfBirth,
    title: profileData.professionalInfo.title,
    department: profileData.professionalInfo.department,
    company: profileData.professionalInfo.company,
    startDate: profileData.professionalInfo.startDate,
    linkedin: profileData.socialLinks.linkedin || "",
    twitter: profileData.socialLinks.twitter || "",
    github: profileData.socialLinks.github || "",
    avatar: profileData.personalInfo.avatar,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    profileData.personalInfo.avatar
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath);
      console.log(publicUrl);
      setPreviewImage(publicUrl);
      setFormData((prev) => ({ ...prev, avatar: publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.avatar) return;

    try {
      setUploadingImage(true);

      const filePath = formData.avatar.split("/").slice(-2).join("/");

      const { error: deleteError } = await supabase.storage
        .from("profiles")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      setPreviewImage("");
      setFormData((prev) => ({ ...prev, avatar: "" }));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onProfileUpdate(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(previewImage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={previewImage} alt="Preview" />
                <AvatarFallback>
                  {formData.firstName[0]}
                  {formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-8">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 border rounded-md p-2 hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    <span>
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </span>
                  </div>

                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </Label>
                {previewImage && (
                  <button
                    onClick={handleImageDelete}
                    className="p-1 text-red-600 border rounded-md hover:bg-red-100"
                    disabled={uploadingImage}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, linkedin: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter URL</Label>
            <Input
              id="twitter"
              value={formData.twitter}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, twitter: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={formData.github}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, github: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || uploadingImage}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfileDetailsPage() {
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.isCollapsed
  );
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [profileData, setProfileData] = useState<ProfileDetails>({
    personalInfo: {
      firstName: "N/A",
      lastName: "N/A",
      email: "N/A",
      phone: "N/A",
      avatar: "/api/placeholder/200/200",
      dateOfBirth: "N/A",
    },
    professionalInfo: {
      title: "N/A",
      department: "N/A",
      company: "N/A",
      startDate: "N/A",
    },
    socialLinks: {},
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setUser(user);
          const metadata = user.user_metadata;

          setProfileData({
            personalInfo: {
              firstName: metadata.firstName || "N/A",
              lastName: metadata.lastName || "N/A",
              email: user.email || "N/A",
              phone: metadata.phone || "N/A",
              avatar: metadata.avatar || "/api/placeholder/200/200",
              dateOfBirth: metadata.dateOfBirth || "N/A",
            },
            professionalInfo: {
              title: metadata.title || "N/A",
              department: metadata.department || "N/A",
              company: metadata.company || "N/A",
              startDate: metadata.startDate || "N/A",
            },
            socialLinks: {
              linkedin: metadata.linkedin,
              twitter: metadata.twitter,
              github: metadata.github,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (formData: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: formData,
      });
      if (error) throw error;
      toast.success(CRM_MESSAGES.PROFILE_UPDATED);
      // Update local state with new data
      setProfileData({
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: user.email,
          phone: formData.phone,
          avatar: formData.avatar,
          dateOfBirth: formData.dateOfBirth,
        },
        professionalInfo: {
          title: formData.title,
          department: formData.department,
          company: formData.company,
          startDate: formData.startDate,
        },
        socialLinks: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          github: formData.github,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };
  // const handleDeleteProfile = async () => {
  //   if (!profileData) return;

  //   setLoading(true);

  //   try {
  //     // 1️⃣ Delete profile image from Supabase (if it exists)
  //     if (profileData.personalInfo.avatar) {
  //       const avatarPath = profileData.personalInfo.avatar.split("/").pop();
  //       await supabase.storage
  //         .from("profiles")
  //         .remove([`avatars/${avatarPath}`]);
  //     }

  //     // 2️⃣ Delete profile from database
  //     const { error } = await supabase
  //       .from("users")
  //       .delete()
  //       .eq("email", profileData.personalInfo.email);

  //     if (error) throw error;

  //     // 3️⃣ Reset UI state
  //     toast.success("Profile deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting profile:", error);
  //     toast.error("Failed to delete profile");
  //   } finally {
  //     setLoading(false);
  //     setIsDeleteDialogOpen(false); // Close dialog after operation
  //   }
  // };

  const calculateYearsOfExperience = (startDate: string) => {
    if (startDate === "N/A") return "N/A";
    try {
      const start = new Date(startDate);
      const today = new Date();
      const years = today.getFullYear() - start.getFullYear();
      return `${years} Years`;
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-500 ease-in-out px-4 py-6 ${
        isCollapsed ? "md:ml-[80px]" : "md:ml-[250px]"
      } w-auto overflow-hidden`}
    >
      <div className="flex flex-row justify-between items-center mb-2 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Profile Details</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="my-2"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit Profile
          </Button>
          {/* <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-500 text-white px-2 py-2 rounded-md"
          >
            Delete Profile
          </button> */}
        </div>
      </div>

      <EditProfileDialog
        profileData={profileData}
        onProfileUpdate={handleProfileUpdate}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6  flex flex-col items-center">
            <Avatar
              className="h-24 md:h-32 w-24 md:w

-32 mb-4"
            >
              <AvatarImage
                src={profileData.personalInfo.avatar}
                alt="Profile Picture"
              />
              <AvatarFallback>
                {profileData.personalInfo.firstName[0]}
                {profileData.personalInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl md:text-2xl font-bold text-center">
              {`${profileData.personalInfo.firstName}`}
            </h2>
            <p className="text-muted-foreground text-center">
              {profileData.professionalInfo.title}
            </p>

            <div className="my-4 space-y-2 px-4 w-full">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className="break-all">
                  {profileData.personalInfo.email}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span>{profileData.personalInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span>Born on {profileData.personalInfo.dateOfBirth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 p-4">
          <CardHeader>
            <CardTitle className="flex items-center mb-2 text-[1.2rem] md:text-2xl">
              <Briefcase className="mr-2" /> Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:flex md:flex-col gap-4">
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-semibold">
                  {profileData.professionalInfo.company}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-semibold">
                  {profileData.professionalInfo.department}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-semibold">
                  {profileData.professionalInfo.startDate}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Experience</p>
                <p className="font-semibold">
                  {calculateYearsOfExperience(
                    profileData.professionalInfo.startDate
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 p-4">
        <CardHeader>
          <CardTitle>Connect with Me</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {profileData.socialLinks.linkedin && (
              <Button
                variant="outline"
                onClick={() =>
                  window.open(profileData.socialLinks.linkedin, "_blank")
                }
              >
                LinkedIn
              </Button>
            )}
            {profileData.socialLinks.twitter && (
              <Button
                variant="outline"
                onClick={() =>
                  window.open(profileData.socialLinks.twitter, "_blank")
                }
              >
                Twitter
              </Button>
            )}
            {profileData.socialLinks.github && (
              <Button
                variant="outline"
                onClick={() =>
                  window.open(profileData.socialLinks.github, "_blank")
                }
              >
                GitHub
              </Button>
            )}
            {!Object.values(profileData.socialLinks).some(Boolean) && (
              <p className="pl-3 text-muted-foreground">
                No social links added
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your profile? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}
