import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabaseClient";

export const workspaceApi = createApi({
  reducerPath: "/api/workspace/",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/workspace/workspace",
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
