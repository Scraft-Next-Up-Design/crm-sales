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
            .eq("user_id", user.id);

          if (error) {
            return res.status(400).json({ error });
          }
          return res.status(200).json({ data });
        }

        default:
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
    }
    case "DELETE": {
      console.log("ok",action)
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

    default:
      return res.status(405).json({ error: AUTH_MESSAGES.API_ERROR });
  }
}
