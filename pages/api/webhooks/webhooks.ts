import { NextApiRequest, NextApiResponse } from "next";
import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "../../../lib/supabaseServer";

interface WebhookRequest {
  status: boolean;
  type: string;
  name: string;
  webhook_url: string;
  workspace_id: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query, headers } = req;
  const action = query.action as string;
  switch (method) {
    case "POST": {
      if (!action) {
        return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }

      const { status, type, name, webhook_url, workspace_id }: WebhookRequest =
        body;
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }

      const token = authHeader.split(" ")[1];
      switch (action) {
        case "createWebhook": {
          // Validate request body
          if (
            status === undefined ||
            !type ||
            !name ||
            !webhook_url ||
            !workspace_id
          ) {
            return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
          }
          // Retrieve session and user details
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }
          // Insert webhook with user ID
          const { data, error } = await supabase.from("webhooks").insert({
            status,
            type,
            name,
            webhook_url,
            user_id: user?.id, // Include user ID in the webhook
            description: " ",
            workspace_id,
          });

          if (error) {
            return res.status(400).json({ error });
          }

          return res.status(200).json({ data });
        }

        default:
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
    }
    case "GET": {
      if (!action) {
        return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }
      const { id: workspace_id } = query;
      console.log(query);
      const token = authHeader.split(" ")[1];
      switch (action) {
        case "getWebhooks": {
          // Retrieve session and user details
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }
          // Fetch webhooks for the user ID
          const { data, error } = await supabase
            .from("webhooks")
            .select("*")
            .eq("workspace_id", workspace_id)
            // .eq("user_id", user.id);

          if (error) {
            return res.status(400).json({ error });
          }
          return res.status(200).json({ data });
        }
        case "getWebhooksBySourceId": {
          const { sourceId, workspaceId } = query;
        
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
        
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }
        
          if (!sourceId) {
            return res.status(400).json({ error: "Source ID is required" });
          }
        
          const webhookUrl = `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/leads?action=getLeads&sourceId=${sourceId}&workspaceId=${workspaceId}`;
          console.log(webhookUrl);
        
          // Query the webhooks table for matching webhook
          const { data, error } = await supabase
            .from("webhooks")
            .select("id, name")
            .eq("user_id", user.id)
            .eq("webhook_url", webhookUrl);
        
          if (error) {
            return res.status(400).json({ error: error.message });
          }
        console.log(data);
          // If a matching webhook is found, return its name
          if (data && data.length > 0) {
            return res.status(200).json({ name: data[0].name });
          }
        
          // If no webhook matches, return a suitable response
          return res.status(404).json({ error: "No matching webhook found" });
        }
        
        default:
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
    }
    case "DELETE": {
      console.log("ok", action);
      if (!action) {
        return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }
      const token = authHeader.split(" ")[1];
      switch (action) {
        case "deleteWebhook": {
          const { id: webhook_id } = body;
          console.log(webhook_id);
          // Validate request body
          if (!webhook_id) {
            return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
          }

          // Retrieve session and user details
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }

          // Delete webhook if it belongs to the user
          const { data, error } = await supabase
            .from("webhooks")
            .delete()
            .eq("user_id", user.id)
            .eq("id", webhook_id);

          if (error) {
            return res.status(400).json({ error });
          }

          return res.status(200).json({ data });
        }
      }
    }
    case "PUT": {
      if (!action) {
        return res.status(400).json({ error: "Action parameter is missing" });
      }

      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized access" });
      }

      const token = authHeader.split(" ")[1];

      switch (action) {
        case "changeWebhookStatus": {
          const { id: webhook_id, status } = body;

          // Validate request body
          if (status === undefined || !webhook_id) {
            return res.status(400).json({ error: "Invalid request body" });
          }

          try {
            // Retrieve session and user details
            const { data: session, error: userError } =
              await supabase.auth.getUser(token);

            if (userError || !session?.user) {
              return res.status(401).json({ error: "User not authorized" });
            }

            const user = session.user;

            // Update webhook status if it belongs to the user
            const { data, error } = await supabase
              .from("webhooks")
              .update({ status })
              .eq("user_id", user.id)
              .eq("id", webhook_id)
              .single();

            if (error) {
              return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({ data });
          } catch (err: any) {
            return res
              .status(500)
              .json({ error: "Server error", details: err.message });
          }
        }

        case "updateWebhook": {
          const { name, description, type } = body;
          const { id: webhook_id } = query;
          // Validate request body
          if (!webhook_id || !name || !type || !description) {
            return res.status(400).json({ error: "Invalid request body" });
          }
          try {
            // Retrieve session and user details
            const { data: session, error: userError } =
              await supabase.auth.getUser(token);

            if (userError || !session?.user) {
              return res.status(401).json({ error: "User not authorized" });
            }

            const user = session.user;

            // Update webhook fields if it belongs to the user
            const { data, error } = await supabase
              .from("webhooks")
              .update({ name, type, description })
              .eq("user_id", user.id)
              .eq("id", webhook_id)
              .single();

            if (error) {
              return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({ data });
          } catch (err: any) {
            return res
              .status(500)
              .json({ error: "Server error", details: err.message });
          }
        }
        default:
          return res.status(400).json({ error: "Invalid action" });
      }
    }

    default:
      return res.status(405).json({ error: AUTH_MESSAGES.API_ERROR });
  }
}
