import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Building, 
  Users, 
  Settings, 
  Lock 
} from 'lucide-react';

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
}

export default function WorkspaceSettingsPage() {
  // Mock workspace settings - replace with actual data
  const [settings, setSettings] = useState<WorkspaceSettings>({
    name: 'Acme Corporation',
    industry: 'Technology',
    size: '51-200',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      sms: false,
      inApp: true
    },
    security: {
      twoFactor: true,
      ipRestriction: false
    }
  });

  const handleSave = () => {
    // Implement save logic
    console.log('Saving workspace settings', settings);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Workspace Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2" /> Basic Information
            </CardTitle>
            <CardDescription>
              Manage your workspace core details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Workspace Name</Label>
              <Input 
                value={settings.name}
                onChange={(e) => setSettings({
                  ...settings, 
                  name: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Industry</Label>
              <Select 
                value={settings.industry}
                onValueChange={(value) => setSettings({
                  ...settings, 
                  industry: value
                })}
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
            <div>
              <Label>Company Size</Label>
              <Select 
                value={settings.size}
                onValueChange={(value) => setSettings({
                  ...settings, 
                  size: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Company Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-50">1-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="500+">500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" /> Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how you receive updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch 
                checked={settings.notifications.email}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    email: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>SMS Notifications</Label>
              <Switch 
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    sms: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>In-App Notifications</Label>
              <Switch 
                checked={settings.notifications.inApp}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    inApp: checked
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2" /> Security
            </CardTitle>
            <CardDescription>
              Manage workspace security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Two-Factor Authentication</Label>
              <Switch 
                checked={settings.security.twoFactor}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    twoFactor: checked
                  }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>IP Address Restriction</Label>
              <Switch 
                checked={settings.security.ipRestriction}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    ipRestriction: checked
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" /> Advanced Settings
            </CardTitle>
            <CardDescription>
              Configure advanced workspace parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Timezone</Label>
              <Select 
                value={settings.timezone}
                onValueChange={(value) => setSettings({
                  ...settings, 
                  timezone: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Workspace Settings</Button>
      </div>
    </div>
  );
}