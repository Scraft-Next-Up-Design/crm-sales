"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DocumentationPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Documentation</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              <section>
                <h4 className="font-medium mb-2">Introduction</h4>
                <p className="text-muted-foreground">
                  Welcome to our CRM system. This guide will help you get
                  started with the basic features and functionalities.
                </p>
              </section>
              <section>
                <h4 className="font-medium mb-2">Quick Start Guide</h4>
                <p className="text-muted-foreground">
                  Learn how to set up your workspace, manage leads, and track
                  your sales pipeline effectively.
                </p>
              </section>
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Features & Tutorials</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              <section>
                <h4 className="font-medium mb-2">Lead Management</h4>
                <p className="text-muted-foreground">
                  Discover how to effectively manage and track your leads
                  through the sales pipeline.
                </p>
              </section>
              <section>
                <h4 className="font-medium mb-2">Analytics & Reporting</h4>
                <p className="text-muted-foreground">
                  Learn how to use our analytics tools to gain insights into
                  your sales performance.
                </p>
              </section>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
