import { webhookApi } from "../base/webhooks";

interface WebhookRequest {
  status: boolean;
  type: string;
  name: string;
  webhook_url?: string;
}

interface WebhookResponse {
 [key: string]: any;
}

export const webhookApis = webhookApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new webhook
    webhook: builder.mutation<WebhookRequest, WebhookResponse>({
      query: (credentials) => ({
        url: "?action=createWebhook",
        method: "POST",
        body: credentials,
      }),
    }),

    // Update an existing webhook
    updateWebhook: builder.mutation<WebhookRequest, WebhookResponse>({
      query: (credentials) => ({
        url: "?action=updateWebhook",
        method: "PUT",
        body: credentials,
      }),
    }),

    // Delete an existing webhook
    deleteWebhook: builder.mutation<{ id: string }, { id: string }>({
      query: ({ id }) => ({
        url: `?action=deleteWebhook`,
        method: "DELETE",
        body: { id },
      }),
    }),

    // Fetch webhooks
    getWebhooks: builder.query<WebhookResponse[], void>({
      query: () => ({
        url: "?action=getWebhooks",
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for the mutations and queries
export const {
  useWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useGetWebhooksQuery,
} = webhookApis;
