import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseServer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "Supabase Key (partial):",
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10)
    );
    const { data, error } = await supabase
      .from("workspaces")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase Error:", error);
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
  } catch (error: unknown) {
    console.error("Caught Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: errorMessage,
    });
  }
}
