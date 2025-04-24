"use client";

import { Button } from "@/components/ui/button";
import { useNetworkSpeed } from "@/lib/utils/optimizations";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  const networkSpeed = useNetworkSpeed();

  return (
    <section
      className="relative py-20 overflow-hidden"
      role="region"
      aria-label="Hero section"
      itemScope
      itemType="https://schema.org/WPHeader"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center" role="presentation">
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in"
            id="hero-title"
          >
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
              itemProp="headline"
            >
              Transform Your Lead Management
            </span>
          </h1>
          <p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]"
            itemProp="description"
          >
            Streamline your lead management process with our powerful CRM
            platform. Track, nurture, and convert leads effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in [animation-delay:400ms]">
            <Link
              href="/login"
              aria-label="Start your free trial"
              className="no-underline"
              itemProp="mainEntityOfPage"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-primary focus:outline-none focus-visible:ring-offset-2"
                aria-describedby="trial-button-desc"
              >
                Start Free Trial{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span id="trial-button-desc" className="sr-only">
                Begin your free trial of our CRM platform
              </span>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-primary focus:outline-none focus-visible:ring-offset-2"
              aria-label="Watch product demo video"
              onClick={() => console.log("Demo video clicked")}
            >
              Watch Demo
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in [animation-delay:600ms]">
            <div className="text-center p-4 rounded-lg bg-card hover:shadow-md transition-all">
              <p className="text-3xl font-bold text-primary">10k+</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card hover:shadow-md transition-all">
              <p className="text-3xl font-bold text-primary">1M+</p>
              <p className="text-sm text-muted-foreground">Leads Managed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card hover:shadow-md transition-all">
              <p className="text-3xl font-bold text-primary">99%</p>
              <p className="text-sm text-muted-foreground">
                Customer Satisfaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
