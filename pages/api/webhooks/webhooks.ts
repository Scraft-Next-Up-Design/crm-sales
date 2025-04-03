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

interface LeadStatus {
  name: string;
}

interface Lead {
  id: string;
  source: string;
  status: string | LeadStatus;
}

interface LeadMetrics {
  [key: string]: {
    totalLeads: number;
    qualifiedLeads: number;
    processingLeads: number;
  };
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
          if (
            status === undefined ||
            !type ||
            !name ||
            !webhook_url ||
            !workspace_id
          ) {
            return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
          }

          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }

          const { data: workspaceOwner, error: ownerError } = await supabase
            .from("workspaces")
            .select("owner_id")
            .eq("id", workspace_id)
            .single();

          if (ownerError) {
            return res.status(500).json({ error: ownerError.message });
          }

          if (workspaceOwner?.owner_id === user.id) {
            // User is the owner, allow webhook creation
          } else {
            const { data: workspaceMember, error: workspaceError } =
              await supabase
                .from("workspace_members")
                .select("role")
                .eq("workspace_id", workspace_id)
                .eq("user_id", user.id)
                .single();

            if (
              workspaceError ||
              !workspaceMember ||
              workspaceMember.role !== "admin"
            ) {
              return res.status(403).json({
                error:
                  "You don't have permission to create a webhook in this workspace.",
              });
            }
          }

          const { data, error } = await supabase.from("webhooks").insert({
            status,
            type,
            name,
            webhook_url,
            user_id: user?.id,
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
      const token = authHeader.split(" ")[1];
      switch (action) {
        case "getWebhooks": {
          const {
            data: { user },
          } = await supabase.auth.getUser(token);
          if (!user) {
            return res.status(401).json({ error: AUTH_MESSAGES.UNAUTHORIZED });
          }

          const { data: webhooks, error: webhookError } = await supabase
            .from("webhooks")
            .select("*")
            .eq("workspace_id", workspace_id);

          if (webhookError) {
            return res.status(400).json({ error: webhookError });
          }

          const { data: leads, error: leadsError } = await supabase
            .from("leads")
            .select("id, source, status")
            .eq("work_id", workspace_id);

          if (leadsError) {
            return res.status(400).json({ error: leadsError });
          }

          const leadMetrics: LeadMetrics = {};

          (leads as Lead[]).forEach((lead) => {
            if (!leadMetrics[lead.source]) {
              leadMetrics[lead.source] = {
                totalLeads: 0,
                qualifiedLeads: 0,
                processingLeads: 0,
              };
            }

            leadMetrics[lead.source].totalLeads++;

            const status =
              typeof lead.status === "string"
                ? (JSON.parse(lead.status) as LeadStatus)
                : (lead.status as LeadStatus);

            if (status && status.name === "Qualified") {
              leadMetrics[lead.source].qualifiedLeads++;
            }

            if (
              status &&
              status.name &&
              status.name !== "Not Reachable/Responding"
            ) {
              leadMetrics[lead.source].processingLeads++;
            }
          });

          const webhooksWithMetrics = webhooks.map((webhook) => {
            const source = webhook.type;
            const metrics = leadMetrics[source] || {
              totalLeads: 0,
              qualifiedLeads: 0,
              processingLeads: 0,
            };

            const qualificationRate =
              metrics.totalLeads > 0
                ? ((metrics.qualifiedLeads / metrics.totalLeads) * 100).toFixed(
                    2
                  )
                : 0;

            const processingRate =
              metrics.totalLeads > 0
                ? (
                    (metrics.processingLeads / metrics.totalLeads) *
                    100
                  ).toFixed(2)
                : 0;

            return {
              ...webhook,
              metrics: {
                totalLeads: metrics.totalLeads,
                qualificationRate: `${qualificationRate}%`,
                processingRate: `${processingRate}%`,
                qualifiedLeads: metrics.qualifiedLeads,
                processingLeads: metrics.processingLeads,
              },
            };
          });

          return res.status(200).json({ data: webhooksWithMetrics });
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
          const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/leads?action=getLeads&sourceId=${sourceId}&workspaceId=${workspaceId}`;

          const { data, error } = await supabase
            .from("webhooks")
            .select("id, name, type")
            .eq("webhook_url", webhookUrl);

          if (error) {
            return res.status(400).json({ error: error.message });
          }
          // If a matching webhook is found, return its name
          if (data && data.length > 0) {
            return res
              .status(200)
              .json({ id: data[0].id, name: data[0].name, type: data[0].type });
          }

          return res.status(404).json({ error: "No matching webhook found" });
        }

        default:
          return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
      }
    }
    case "DELETE": {
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

          if (!webhook_id) {
            return res.status(400).json({ error: AUTH_MESSAGES.API_ERROR });
          }

          try {
            const { data: session, error: userError } =
              await supabase.auth.getUser(token);

            if (userError || !session?.user) {
              return res.status(401).json({ error: "User not authorized" });
            }

            const user = session.user;

            const { data: webhook, error: webhookError } = await supabase
              .from("webhooks")
              .select("user_id, workspace_id")
              .eq("id", webhook_id)
              .single();

            if (webhookError) {
              return res.status(500).json({ error: webhookError.message });
            }

            if (!webhook) {
              return res.status(404).json({ error: "Webhook not found" });
            }

            const { user_id, workspace_id } = webhook;

            if (user_id === user.id) {
              const { data, error } = await supabase
                .from("webhooks")
                .delete()
                .eq("id", webhook_id);

              if (error) {
                return res.status(400).json({ error: error.message });
              }

              return res.status(200).json({ data });
            }

            const { data: membership, error: membershipError } = await supabase
              .from("workspace_members")
              .select("role")
              .eq("workspace_id", workspace_id)
              .eq("user_id", user.id)
              .single();

            if (membershipError) {
              return res.status(500).json({ error: membershipError.message });
            }

            if (!membership || membership.role !== "admin") {
              return res
                .status(403)
                .json({ error: "You Don't have Permission to Delete webhook" });
            }

            const { data, error } = await supabase
              .from("webhooks")
              .delete()
              .eq("id", webhook_id);

            if (error) {
              return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({ data });
          } catch (err: any) {
            console.error(err);
            return res
              .status(500)
              .json({ error: "Server error", details: err.message });
          }
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

          if (status === undefined || !webhook_id) {
            return res.status(400).json({ error: "Invalid request body" });
          }

          try {
            const { data: session, error: userError } =
              await supabase.auth.getUser(token);

            if (userError || !session?.user) {
              return res.status(401).json({ error: "User not authorized" });
            }

            const user = session.user;

            const { data: webhook, error: webhookError } = await supabase
              .from("webhooks")
              .select("user_id, workspace_id")
              .eq("id", webhook_id)
              .single();

            if (webhookError) {
              return res.status(500).json({ error: webhookError.message });
            }

            if (!webhook) {
              return res.status(404).json({ error: "Webhook not found" });
            }

            const { user_id, workspace_id } = webhook;

            if (user_id === user.id) {
              const { data, error } = await supabase
                .from("webhooks")
                .update({ status })
                .eq("id", webhook_id)
                .single();

              if (error) {
                return res.status(400).json({ error: error.message });
              }

              return res.status(200).json({ data });
            }

            const { data: membership, error: membershipError } = await supabase
              .from("workspace_members")
              .select("role")
              .eq("workspace_id", workspace_id)
              .eq("user_id", user.id)
              .single();

            if (membershipError) {
              return res.status(500).json({ error: membershipError.message });
            }

            if (!membership || membership.role !== "admin") {
              return res
                .status(403)
                .json({ error: "You Don,t have Permission to Change status" });
            }

            const { data, error } = await supabase
              .from("webhooks")
              .update({ status })
              .eq("id", webhook_id)
              .single();

            if (error) {
              return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({ data });
          } catch (err: any) {
            console.error(err);
            return res
              .status(500)
              .json({ error: "Server error", details: err.message });
          }
        }

        case "updateWebhook": {
          const { name, description, type } = body;
          const { id: webhook_id } = query;

          if (!webhook_id || !name || !type || !description) {
            return res.status(400).json({ error: "Invalid request body" });
          }

          try {
            const { data: session, error: userError } =
              await supabase.auth.getUser(token);

            if (userError || !session?.user) {
              return res.status(401).json({ error: "User not authorized" });
            }

            const user = session.user;

            const { data: webhook, error: webhookError } = await supabase
              .from("webhooks")
              .select("user_id, workspace_id")
              .eq("id", webhook_id)
              .single();

            if (webhookError) {
              return res.status(500).json({ error: webhookError.message });
            }

            if (!webhook) {
              return res.status(404).json({ error: "Webhook not found" });
            }

            const { user_id, workspace_id } = webhook;

            if (user_id === user.id) {
              const { data, error } = await supabase
                .from("webhooks")
                .update({ name, type, description })
                .eq("id", webhook_id)
                .single();

              if (error) {
                return res.status(400).json({ error: error.message });
              }

              return res.status(200).json({ data });
            }

            const { data: membership, error: membershipError } = await supabase
              .from("workspace_members")
              .select("role")
              .eq("workspace_id", workspace_id)
              .eq("user_id", user.id)
              .single();

            if (membershipError) {
              return res.status(500).json({ error: membershipError.message });
            }

            if (
              !membership ||
              membership.role !== "admin" ||
              membership.role !== "SuperAdmin"
            ) {
              return res
                .status(403)
                .json({ error: "You Don't have Permission to Update webhook" });
            }

            const { data, error } = await supabase
              .from("webhooks")
              .update({ name, type, description })
              .eq("id", webhook_id)
              .single();

            if (error) {
              return res.status(400).json({ error: error.message });
            }

            return res.status(200).json({ data });
          } catch (err: any) {
            console.error(err);
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
