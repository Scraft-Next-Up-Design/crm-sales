import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "@/lib/supabaseClient";
import { getCacheItem, setCacheItem } from "@/lib/utils/cacheUtils";
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

    // Try to get data from cache first
    const cacheKey = `dashboard_${workspaceId}`;
    const cachedData = await getCacheItem(cacheKey, { duration: "short" });

    if (cachedData) {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=30"
      );
      return res.status(200).json(cachedData);
    }

    // Fetch all dashboard data in parallel with optimized queries using RPC
    const [revenueData, leadsStats] = await Promise.all([
      // Revenue data using RPC for better performance
      supabase.rpc("calculate_workspace_revenue", {
        workspace_id: workspaceId,
      }),

      // Combined leads stats using RPC
      supabase.rpc("get_workspace_leads_stats", { workspace_id: workspaceId }),
    ]);

    const dashboardData = {
      revenue: revenueData.data || 0,
      ...leadsStats.data,
    };

    // Cache the dashboard data
    await setCacheItem(cacheKey, dashboardData, {
      duration: "short",
      storage: "memory",
    });

    // Set HTTP cache headers
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=30"
    );
    return res.status(200).json(dashboardData);
  } catch (error: any) {
    console.error("Dashboard data fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}
