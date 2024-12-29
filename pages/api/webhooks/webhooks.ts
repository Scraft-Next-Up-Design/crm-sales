import { NextApiRequest, NextApiResponse } from "next";
import { AUTH_MESSAGES } from "@/lib/constant/auth";
import { supabase } from "../../../lib/supabaseServer";

interface WebhookRequest {
  status: boolean;
  type: string;
  name: string;
  webhook_url: string;
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

      const { status, type, name, webhook_url }: WebhookRequest = body;
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }

      const token = authHeader.split(" ")[1];
      switch (action) {
        case "createWebhook": {
          // Validate request body
          if (status === undefined || !type || !name || !webhook_url) {
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
          });

          if (error) {
            return res.status(400).json({ error });
          }

          return res.status(200).json({ data });
        }
        //         case "updateWebhook": {
        //           const { webhook_id, status, type, name, webhook_url }: WebhookRequest = body;

        //           // Validate request body
        //           if (!webhook_id || status === undefined || !type || !name || !webhook_url) {
        //             return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
        //           }

        //           // Retrieve session and user details
        //           const {
        //             data: { user },
        //           } = await supabase.auth.getUser(token);
        //           if (!user) {
        //             return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
        //           }
        // console.log("User:", user);
        //           // Update webhook if it belongs to the user
        //           const { data, error } = await supabase
        //             .from("webhooks")
        //             .update({
        //               status,
        //               type,
        //               name,
        //               webhook_url,
        //             })
        //             .eq("user_id", user.id)
        //             .eq("id", webhook_id);

        //           if (error) {
        //             return res.status(400).json({ error });
        //           }

        //           return res.status(200).json({ data });
        //         }

        case "deleteWebhook": {
          const { webhook_id }: { webhook_id: number } = body;

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

        default:
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
    }

    case "GET": {
      console.log("Action:", action);
      if (!action) {
        return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
      }

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
          console.log("User:", user);
          // Fetch webhooks for the user ID
          const { data, error } = await supabase
            .from("webhooks")
            .select("*")
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

    default:
      return res.status(405).json({ error: AUTH_MESSAGES.API_ERROR });
  }
}

