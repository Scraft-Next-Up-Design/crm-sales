import { cookies } from "next/headers";
import { Suspense } from "react";
import LeadManagement from "./leads-client";
import { LeadsSkeleton } from "./leads-skeleton";

export const runtime = "edge";
export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return {
        title: "Lead Management | CRM Sales",
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
      title: `Lead Management | ${data?.data?.name || "CRM Sales"}`,
      description: "Manage and track your sales leads efficiently",
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "Lead Management | CRM Sales",
    };
  }
}

export default function LeadsPage() {
  return (
    <div className="leads-container">
      <Suspense fallback={<LeadsSkeleton />}>
        <LeadManagement />
      </Suspense>
    </div>
  );
}
