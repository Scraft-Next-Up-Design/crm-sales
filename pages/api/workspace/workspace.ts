import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseServer"; // Import the Supabase client
import { AUTH_MESSAGES } from "@/lib/constant/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query, headers } = req;
  const action = query.action as string;
  console.log(method);
  switch (method) {
    case "POST": {
      if (!method) {
        return res.status(400).json({ error: AUTH_MESSAGES.SIGNUP_FAILED });
      }
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }
      const token = authHeader.split(" ")[1];

      switch (action) {
        case "createWorkspace": {
          const {
            name,
            status,
            companyType,
            companySize,
            industry,
            timezone,
            notifications,
          } = body;

          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }

          // Validate input fields (you can improve this validation)
          if (!name || !status || !companyType || !companySize || !industry) {
            return res.status(400).json({ error: "Missing required fields" });
          }

          try {
            // Insert the data into the 'workspaces' table
            const { data, error } = await supabase.from("workspaces").insert([
              {
                name,
                status,
                company_type: companyType,
                company_size: companySize,
                industry,
                timezone,
                notifications,
                owner_id: user?.id,
              },
            ]);

            if (error) {
              return res.status(500).json({ error: error.message });
            }

            return res.status(201).json({ message: "Workspace created", data });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "An error occurred" });
          }
        }
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    }
    case "GET": {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }
      const token = authHeader.split(" ")[1];

      switch (action) {
        case "getWorkspaces": {
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }
          try {
            // Fetch workspaces owned by the authenticated user
            const { data, error } = await supabase
              .from("workspaces")
              .select("*")
              .eq("owner_id", user?.id);
            if (error) {
              return res.status(500).json({ error: error.message });
            }

            return res
              .status(200)
              .json({ message: "Workspaces fetched", data });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "An error occurred" });
          }
        }
        case "getActiveWorkspace": {
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          } // Extract userId from the query
          if (!user) {
            return res.status(400).json({ error: "User ID is required" });
          }

          const { data, error } = await supabase
            .from("workspaces")
            .select("*")
            .eq("status", true)
            .eq("owner_id", user.id) // Match user_id
            .limit(1)
            .single(); // Expect only one active workspace

          if (error) {
            return res.status(400).json({ error: error.message });
          }

          return res.status(200).json({ data });
        }
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    }
    case "PATCH": {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }
      const token = authHeader.split(" ")[1];

      switch (action) {
        case "updateWorkspaceStatus": {
          const { id: workspace_id, status } = body;
          if (!workspace_id || typeof status === "undefined") {
            return res.status(400).json({
              error: "workspace_id, status, and user_id are required",
            });
          }

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser(token);
            if (!user) {
              return res
                .status(401)
                .json({ error: AUTH_MESSAGES.UNAUTHORIZED });
            }
            // Set all statuses to false for workspaces owned by the user
            const resetStatus = await supabase
              .from("workspaces")
              .update({ status: false })
              .eq("owner_id", user.id); // Assuming `owner_id` is the column for workspace ownership

            if (resetStatus.error) {
              throw new Error(resetStatus.error.message);
            }

            // Update the specific workspace's status to true
            const updateStatus = await supabase
              .from("workspaces")
              .update({ status: true })
              .eq("id", workspace_id)
              .eq("owner_id", user.id); // Ensure the workspace belongs to the user

            if (updateStatus.error) {
              throw new Error(updateStatus.error.message);
            }

            return res
              .status(200)
              .json({ message: "Workspace status updated successfully" });
          } catch (error: any) {
            console.error("Error updating workspace status:", error.message);
            return res.status(500).json({ error: "Internal server error" });
          }
        }
      }
    }

    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}
