"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type IntegrationStatus = "connected" | "disconnected";

interface Integration {
  name: string;
  description: string;
  status: IntegrationStatus;
  icon: string;
}

const integrations: Integration[] = [
  {
    name: "Email Service",
    description: "Connect your email service to sync communications",
    status: "disconnected",
    icon: "📧",
  },
  {
    name: "Calendar",
    description: "Sync your calendar for meeting management",
    status: "disconnected",
    icon: "📅",
  },
  {
    name: "Document Storage",
    description: "Connect your document storage service",
    status: "disconnected",
    icon: "📁",
  },
];

export default function IntegrationPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <Button variant="outline">Refresh Connections</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{integration.icon}</span>
                <h3 className="text-lg font-semibold">{integration.name}</h3>
              </div>
              <Badge
                variant={
                  integration.status === "connected" ? "default" : "secondary"
                }
              >
                {integration.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">
              {integration.description}
            </p>
            <Button className="w-full" variant="outline">
              {integration.status === "connected" ? "Manage" : "Connect"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
