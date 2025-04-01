import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabaseClient";

const CACHE_TIME = 5 * 60;

export const webhookApi = createApi({
  reducerPath: "/api/webhooks/",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/webhooks/webhooks",
    prepareHeaders: async (headers) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers.set("authorization", `Bearer ${session.access_token}`);
        }
        return headers;
      } catch (error) {
        console.error("Error preparing headers:", error);
        return headers;
      }
    },
    timeout: 10000, 
  }),
  keepUnusedDataFor: CACHE_TIME,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 300, 
  tagTypes: ["Webhook"],
  endpoints: () => ({}),
});
