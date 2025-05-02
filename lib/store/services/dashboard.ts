import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return (action.payload as any)[reducerPath];
    }
  },
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: (workspaceId) => ({
        url: `/dashboard/${workspaceId}`,
        method: "GET",
      }),
      providesTags: ["Dashboard"],
      transformResponse: (response: any) => response.data,
      // Cache for 1 minute
      keepUnusedDataFor: 60,
    }),
    getRealTimeUpdates: builder.query({
      query: (workspaceId) => ({
        url: `/dashboard/${workspaceId}/realtime`,
        method: "GET",
      }),
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;

          const eventSource = new EventSource(`/api/dashboard/${arg}/realtime`);

          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateCachedData((draft) => {
              Object.assign(draft, data);
            });
          };

          await cacheEntryRemoved;
          eventSource.close();
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }
      },
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetRealTimeUpdatesQuery,
  util: { getRunningQueriesThunk },
} = dashboardApi;

export const { getDashboardData } = dashboardApi.endpoints;
