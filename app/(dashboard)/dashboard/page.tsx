import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { cookies } from "next/headers";
import { Suspense } from "react";
import DashboardClient from "./dashboard-client";

export const runtime = "edge";

export const revalidate = 300;

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return {
        title: "Dashboard | CRM Sales",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(
      `${baseUrl}/api/workspace/workspace?action=getActiveWorkspace`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    const data = await response.json();

    return {
      title: `Dashboard | ${data?.data?.name || "CRM Sales"}`,
      description: "Sales performance dashboard with real-time analytics",
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "Dashboard | CRM Sales",
    };
  }
}

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
