import { supabase } from "@/lib/supabaseServer";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("workspaces")
      .select("count")
      .limit(1);

    if (error) {
      return res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        supabase: {
          status: "down",
          error: error.message,
        },
      });
    }

    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      supabase: {
        status: "up",
        latency: process.hrtime()[0],
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: "Internal server error",
    });
  }
}
