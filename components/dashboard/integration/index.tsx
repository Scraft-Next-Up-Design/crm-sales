import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FC } from "react";

export interface IntegrationManagerProps {
  className?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected";
}

const integrations: Integration[] = [
  {
    id: "1",
    name: "Email Marketing",
    description: "Connect with your email marketing platform",
    status: "disconnected",
  },
  {
    id: "2",
    name: "CRM System",
    description: "Sync with your existing CRM system",
    status: "connected",
  },
  {
    id: "3",
    name: "Analytics Platform",
    description: "Connect with analytics tools",
    status: "disconnected",
  },
];

export const IntegrationManager: FC<IntegrationManagerProps> = ({
  className,
}) => {
  return (
    <div className={className}>
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Integrations</h2>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-sm text-gray-500">
                  {integration.description}
                </p>
              </div>
              <Button
                variant={
                  integration.status === "connected" ? "destructive" : "default"
                }
                size="sm"
              >
                {integration.status === "connected" ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};