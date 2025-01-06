import { NextApiRequest, NextApiResponse } from "next";
import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "../../../lib/supabaseServer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query, headers } = req;
  const action = query.action as string;
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
  }

  const token = authHeader.split(" ")[1];
  switch (method) {
    case "PUT":
      switch (action) {
        case "updateLeadById": {
          const { id } = query;
          const body = req.body;
          console.log(body, id);
          if (!id) {
            return res.status(400).json({ error: "Lead ID is required" });
          }

          const {
            data: { user },
          } = await supabase.auth.getUser(token);

          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }

          if (!body) {
            return res.status(400).json({ error: "Update data is required" });
          }

          const { data, error } = await supabase
            .from("leads")
            .update({ status: body })
            .eq("id", id)
            .eq("user_id", user.id);

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ data });
        }

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    case "POST":
      switch (action) {
        case "updateNotesById": {
          const { id } = query; // Extract ID from query parameters
          const body = req.body; // Extract body payload
          console.log("Request Body:", body, "Lead ID:", id);

          if (!id) {
            return res.status(400).json({ error: "Lead ID is required" });
          }

          if (!body) {
            return res
              .status(400)
              .json({ error: "Update data is required in 'text_area' field" });
          }

          // Authenticate the user using Supabase
          const {
            data: { user },
          } = await supabase.auth.getUser(token);

          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }

          // Update the `leads` table
          const { data, error } = await supabase
            .from("leads")
            .update({ text_area: body.text_area }) // Update the `text_area` field
            .eq("id", id) // Match the ID
            .eq("user_id", user.id); // Ensure the user owns the record

          if (error) {
            console.error("Supabase Update Error:", error.message);
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ data });
        }
        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    case "GET":
      switch (action) {
        case "getLeads": {
          const sourceId = query.sourceId as string;
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }
          if (!sourceId) {
            return res.status(400).json({ error: "Source ID is required" });
          }

          if (!user) {
            return res.status(400).json({ error: "User ID is required" });
          }

          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("source_id", sourceId)
            .eq("user_id", user.id);

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
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }
          if (!workspaceId) {
            return res.status(400).json({ error: "Workspace ID is required" });
          }

          if (!user) {
            return res.status(400).json({ error: "User ID is required" });
          }

          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("work_id", workspaceId)
            .eq("user_id", user.id);

          if (error) {
            return res.status(400).json({ error: error.message });
          }
          return res.status(200).json({ data });
        }
        case "getLeadById": {
          const id = query.id as string;
          console.log(query);

          const {
            data: { user },
          } = await supabase.auth.getUser(token);

          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }

          if (!user) {
            return res.status(400).json({ error: "User ID is required" });
          }

          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("user_id", user.id)
            .eq("id", id);
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
