import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                The Ultimate CRM for Sales Teams
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Streamline your sales process, manage leads effectively, and boost your team&apos;s performance with our comprehensive CRM solution.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">Lead Management</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Efficiently track and manage your leads through the entire sales pipeline.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">Communication Hub</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Integrated messaging and calling features to stay connected with your leads.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">Analytics & Reporting</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Comprehensive analytics to track performance and make data-driven decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="text-3xl font-bold mt-2">$0</p>
                <p className="text-sm text-gray-500">Forever free</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Up to 100 leads</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card className="p-6 border-primary">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-3xl font-bold mt-2">$29</p>
                <p className="text-sm text-gray-500">per user/month</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Unlimited leads</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <p className="text-3xl font-bold mt-2">Custom</p>
                <p className="text-sm text-gray-500">Contact us for pricing</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Custom integration</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  <span>SLA guarantee</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}