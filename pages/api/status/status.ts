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
          typeof countInStatistics === "undefined" ||
          typeof showInWorkspace === "undefined"
        ) {
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
        }

        try {
          // Fetch the workspace details to verify ownership or membership
          const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .select("*")
            .eq("id", workspaceId)
            .single(); // Expect only one workspace

          if (workspaceError) {
            return res.status(500).json({ error: workspaceError.message });
          }

          if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
          }

          // Check if the user is the owner
          if (workspace.owner_id !== user.id) {
            // If not the owner, check if the user is a member
            const { data: membership, error: membershipError } = await supabase
              .from("workspace_members")
              .select("*")
              .eq("workspace_id", workspaceId)
              .eq("user_id", user.id)
              .single(); // Expect only one match

            if (membershipError) {
              return res.status(500).json({ error: membershipError.message });
            }

            if (!membership) {
              return res
                .status(403)
                .json({ error: AUTH_MESSAGES.UNAUTHORIZED });
            }
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
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "An error occurred" });
        }
      }
      return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
    }

    case "PUT": {
      if (action === "updateStatus") {
        const { id, name, description, workspaceId }: UpdatedStatusRequest =
          body;

        if (!id || !workspaceId) {
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
        }

        try {
          // Fetch the workspace details to verify ownership or membership
          const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .select("*")
            .eq("id", workspaceId)
            .single(); // Expect only one workspace

          if (workspaceError) {
            return res.status(500).json({ error: workspaceError.message });
          }

          if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
          }

          // Check if the user is the owner
          if (workspace.owner_id !== user.id) {
            // If not the owner, check if the user is a member
            const { data: membership, error: membershipError } = await supabase
              .from("workspace_members")
              .select("*")
              .eq("workspace_id", workspaceId)
              .eq("user_id", user.id)
              .single(); // Expect only one match

            if (membershipError) {
              return res.status(500).json({ error: membershipError.message });
            }

            if (!membership) {
              return res
                .status(403)
                .json({ error: AUTH_MESSAGES.UNAUTHORIZED });
            }
          }

          // Update the status in the database
          const { data, error } = await supabase
            .from("statuses")
            .update({ name, description, workspace_id: workspaceId })
            .eq("id", id)
            .eq("workspace_id", workspaceId); // Ensure the status belongs to the workspace

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "An error occurred" });
        }
      }
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

        try {
          // Fetch the workspace details to verify ownership or membership
          const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .select("*")
            .eq("id", workspaceId)
            .single(); // Expect only one workspace

          if (workspaceError) {
            return res.status(500).json({ error: workspaceError.message });
          }

          if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
          }

          // Check if the user is the owner
          if (workspace.owner_id !== user.id) {
            // If not the owner, check if the user is a member
            const { data: membership, error: membershipError } = await supabase
              .from("workspace_members")
              .select("*")
              .eq("workspace_id", workspaceId)
              .eq("user_id", user.id)
              .single(); // Expect only one match

            if (membershipError) {
              return res.status(500).json({ error: membershipError.message });
            }

            if (!membership) {
              return res
                .status(403)
                .json({ error: AUTH_MESSAGES.UNAUTHORIZED });
            }
          }

          // Retrieve statuses from the database
          const { data, error } = await supabase
            .from("status")
            .select("*")
            .eq("work_id", workspaceId); // Only filter by workspace ID as the user is already authorized

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "An error occurred" });
        }
      }

      return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
    }

    default:
      return res.status(405).json({ error: AUTH_MESSAGES.API_ERROR });
  }
}
