import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabaseClient";
import { RootState } from "../store";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    prepareHeaders: async (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers.set("authorization", `Bearer ${session.access_token}`);
        }
      }
      return headers;
    },
  }),
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
