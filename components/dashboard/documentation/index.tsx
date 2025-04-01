import { Card } from "@/components/ui/card";

export interface DocumentationContentProps {
  className?: string;
}

export function DocumentationContent({ className }: DocumentationContentProps) {
  return (
    <div className={className}>
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Documentation</h2>
        <div className="prose dark:prose-invert max-w-none">
          <h3>Getting Started</h3>
          <p>
            Welcome to the CRM Sales documentation. Here you&apos;ll find
            everything you need to know about using the platform.
          </p>

          <h3>Features</h3>
          <ul>
            <li>Lead Management</li>
            <li>Analytics Dashboard</li>
            <li>Integration Tools</li>
            <li>Reporting System</li>
          </ul>

          <h3>Need Help?</h3>
          <p>
            If you need assistance, please check our support section or contact
            our team.
          </p>
        </div>
      </Card>
    </div>
  );
}
