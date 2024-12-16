import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const features = {
    free: [
      "Up to 100 leads",
      "Basic lead management",
      "Email support",
      "Basic analytics",
      "Single user",
    ],
    pro: [
      "Unlimited leads",
      "Advanced lead management",
      "Priority support",
      "Advanced analytics",
      "Up to 10 users",
      "API access",
      "Custom fields",
      "Automation workflows",
    ],
    enterprise: [
      "Everything in Pro",
      "Unlimited users",
      "Custom integration",
      "Dedicated support",
      "SLA guarantee",
      "Custom reporting",
      "Advanced security",
      "Training sessions",
    ],
  };

  return (
    <div className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-gray-500 md:text-xl">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {features.free.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 border-primary relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm rounded-bl-lg">
              Popular
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-500">/user/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {features.pro.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {features.enterprise.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}