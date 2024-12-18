'use client';
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Profile Interface
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

export default function ProfileDetailsPage() {
  // Mock Profile Data - Replace with actual data fetching
  const profileData: ProfileDetails = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      avatar: '/api/placeholder/200/200',
      dateOfBirth: '1990-05-15'
    },
    professionalInfo: {
      title: 'Senior Product Manager',
      department: 'Product Development',
      company: 'Tech Innovations Inc.',
      startDate: '2020-03-01'
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      github: 'https://github.com/johndoe'
    }
  };

  const calculateYearsOfExperience = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const years = today.getFullYear() - start.getFullYear();
    return years;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Details</h1>
        <Button variant="outline">Edit Profile</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Personal Information Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage 
                src={profileData.personalInfo.avatar} 
                alt="Profile Picture" 
              />
              <AvatarFallback>
                {profileData.personalInfo.firstName[0]}
                {profileData.personalInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-2xl font-bold">
              {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
            </h2>
            <p className="text-muted-foreground">
              {profileData.professionalInfo.title}
            </p>

            <div className="mt-4 space-y-2 w-full">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{profileData.personalInfo.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{profileData.personalInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Born on {profileData.personalInfo.dateOfBirth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2" /> Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                  {calculateYearsOfExperience(profileData.professionalInfo.startDate)} Years
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Connect with Me</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {profileData.socialLinks.linkedin && (
              <Button 
                variant="outline" 
                onClick={() => window.open(profileData.socialLinks.linkedin, '_blank')}
              >
                LinkedIn
              </Button>
            )}
            {profileData.socialLinks.twitter && (
              <Button 
                variant="outline" 
                onClick={() => window.open(profileData.socialLinks.twitter, '_blank')}
              >
                Twitter
              </Button>
            )}
            {profileData.socialLinks.github && (
              <Button 
                variant="outline" 
                onClick={() => window.open(profileData.socialLinks.github, '_blank')}
              >
                GitHub
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
