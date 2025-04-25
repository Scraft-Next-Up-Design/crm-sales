import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query, headers } = req;
  const { workspaceId } = query;
  const authHeader = headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
  }

  const token = authHeader.split(" ")[1];

  if (method !== "GET") {
    return res.status(405).json({
      error: AUTH_MESSAGES.API_ERROR,
      message: `Method ${method} is not allowed.`,
    });
  }

  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required" });
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
    }

    // Fetch all dashboard data in parallel with optimized queries
    const [revenue, arrivedLeads, totalLeads, qualifiedLeads] =
      await Promise.all([
        // Revenue data - Using sum aggregation
        supabase
          .from("leads")
          .select("sum(revenue)")
          .eq("workspace_id", workspaceId)
          .eq("status", "closed")
          .single(),

        // Arrived leads count
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "arrived"),

        // Total leads count
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId),

        // Qualified leads count
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "qualified"),
      ]);

    // Prepare response data with optimized calculations
    const dashboardData = {
      revenue: revenue.data?.sum || 0,
      arrivedLeadsCount: arrivedLeads.count || 0,
      totalLeadsCount: totalLeads.count || 0,
      qualifiedLeadsCount: qualifiedLeads.count || 0,
    };

    // Set HTTP cache headers for CDN and browser caching
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=60"
    );
    return res.status(200).json(dashboardData);
  } catch (error: any) {
    console.error("Dashboard data fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}
