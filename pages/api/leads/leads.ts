import { NextApiRequest, NextApiResponse } from "next";
import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "../../../lib/supabaseServer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const action = query.action as string;

  switch (method) {
    case "GET":
      switch (action) {
        case "getLeads": {
          const sourceId = query.sourceId as string;
          if (!sourceId) {
            return res.status(400).json({ error: "Source ID is required" });
          }

          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("source_id", sourceId);

          if (error) {
            return res.status(400).json({ error: error.message });
          }
          return res.status(200).json({ data });
        }

        case "getLeadsByUser": {
          const userId = query.userId as string;
          if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
          }

          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("user_id", userId);

          if (error) {
            return res.status(400).json({ error: error.message });
          }
          return res.status(200).json({ data });
        }

        case "getLeadsByWorkspace": {
          const workspaceId = query.workspaceId as string;
          if (!workspaceId) {
            return res.status(400).json({ error: "Workspace ID is required" });
          }

          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("workspace_id", workspaceId);

          if (error) {
            return res.status(400).json({ error: error.message });
          }
          return res.status(200).json({ data });
        }

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }

    default:
      return res.status(405).json({
        error: AUTH_MESSAGES.API_ERROR,
        message: `Method ${method} is not allowed.`,
      });
  }
}
