import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM Sales Dashboard - Manage Your Sales Pipeline",
  description:
    "Powerful CRM solution for managing sales pipeline, leads, and customer relationships efficiently.",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
  robots: "index, follow, max-image-preview:large",
  keywords:
    "CRM, sales, dashboard, lead management, customer relationship, sales pipeline, business management",
  openGraph: {
    title: "CRM Sales Dashboard",
    description:
      "Powerful CRM solution for managing sales pipeline, leads, and customer relationships efficiently.",
    type: "website",
    url: "https://your-domain.com",
    images: [
      {
        url: "https://your-domain.com/og-image.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CRM Sales Dashboard",
    description:
      "Powerful CRM solution for managing sales pipeline, leads, and customer relationships efficiently.",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://your-domain.com",
  },
  applicationName: "CRM Sales Dashboard",
};
