import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabaseClient";
export const webhookApi = createApi({
  reducerPath: "/api/webhooks/",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/webhooks/webhooks",
    prepareHeaders: async (headers) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.set("authorization", `Bearer ${session.access_token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
});
