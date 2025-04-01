"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WorkspacePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <Button variant="outline">Save Changes</Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace Name</label>
                <Input placeholder="My Workspace" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Describe your workspace" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input type="url" placeholder="https://example.com" />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button>Invite Member</Button>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-muted-foreground text-center">
                  No team members added yet
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Billing Information</h3>
              <div className="border rounded-lg p-4">
                <p className="text-muted-foreground text-center">
                  No billing information available
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
