import { supabase } from "../../lib/supabaseServer";
import { NextApiRequest, NextApiResponse } from "next";
import { PostgrestError } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Fetching from Supabase...");
    const startTime = process.hrtime();
    const { data, error } = await supabase
      .from("workspaces")
      .select("count")
      .limit(1);
    const duration =
      process.hrtime(startTime)[0] * 1000 +
      process.hrtime(startTime)[1] / 1000000; // ms

    if (error) {
      console.error("Supabase Error:", error);
      const supabaseError = error as PostgrestError;
      return res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        supabase: {
          status: "down",
          error: supabaseError.message || "Unknown Supabase error",
        },
      });
    }

    console.log("Supabase Success, Duration:", duration, "ms");
    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      supabase: {
        status: "up",
        latency: duration,
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Caught Error:", error);
    const caughtError = error as Error;
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: caughtError.message || "Internal server error",
    });
  }
}
