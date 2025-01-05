import { NextApiRequest, NextApiResponse } from "next";
import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "../../../lib/supabaseServer";

interface StatusRequest {
  [key: string]: string;
}

interface UpdatedStatusRequest extends Partial<StatusRequest> {
  id: string; // ID is required for updates
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query, headers } = req;
  const action = query.action as string;

  if (!action) {
    return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
  }

  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
  }

  const token = authHeader.split(" ")[1];

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) {
    return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
  }

  switch (method) {
    case "POST": {
      if (action === "createStatus") {
        const { workspaceId } = query;
        const { name, color, countInStatistics, showInWorkspace } = body;
        if (
          !name ||
          !workspaceId ||
          !color ||
          !countInStatistics ||
          !showInWorkspace
        ) {
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
        }

        // Insert status into the database
        const { data, error } = await supabase.from("status").insert({
          name,
          color,
          count_statistics: countInStatistics,
          workspace_show: showInWorkspace,
          work_id: workspaceId,
          user_id: user.id,
        });

        if (error) {
          return res.status(400).json({ error });
        }

        return res.status(200).json({ data });
      }
      return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
    }

    case "PUT": {
      if (action === "updateStatus") {
        const { id, name, description, workspaceId }: UpdatedStatusRequest =
          body;

        if (!id) {
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
        }

        // Update status in the database
        const { data, error } = await supabase
          .from("statuses")
          .update({ name, description, workspace_id: workspaceId })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          return res.status(400).json({ error });
        }

        return res.status(200).json({ data });
      }
      return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
    }

    case "DELETE": {
      if (action === "deleteStatus") {
        const { id }: { id: string } = body;

        if (!id) {
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
        }

        // Delete status from the database
        const { data, error } = await supabase
          .from("statuses")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          return res.status(400).json({ error });
        }

        return res.status(200).json({ data });
      }
      return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
    }

    case "GET": {
      if (action === "getStatus") {
        const { workspaceId } = query;

        if (!workspaceId) {
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
        }

        // Retrieve statuses from the database
        const { data, error } = await supabase
          .from("statuses")
          .select("*")
          .eq("workspace_id", workspaceId)
          .eq("user_id", user.id);

        if (error) {
          return res.status(400).json({ error });
        }

        return res.status(200).json({ data });
      }
      return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
    }

    default:
      return res.status(405).json({ error: AUTH_MESSAGES.API_ERROR });
  }
}
