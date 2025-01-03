import { leadsApi } from "../base/leadsapi";

export interface Lead {
  [key: string]: any;
}

export const leadsApis = leadsApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<Lead[], { userId: string; sourceId: string }>({
      query: ({ userId, sourceId }) => ({
        url: `?action=getLeads&userId=${userId}&sourceId=${sourceId}`,
      }),
    }),
    getLeadsByUser: builder.query<Lead[], { userId: string }>({
      query: ({ userId }) => ({
        url: `?action=getLeadsByUser&userId=${userId}`,
      }),
    }),
    getLeadsByWorkspace: builder.query<Lead[], { workspaceId: string }>({
      query: ({ workspaceId }) => ({
        url: `?action=getLeadsByWorkspace&workspaceId=${workspaceId}`,
      }),
    }),
    getLeadById: builder.query<Lead, { id: string }>({
      query: ({ id }) => ({
        url: `?action=getLeadById&id=${id}`,
      }),
    }),
    createLead: builder.mutation<Lead, { userId: string; body: Partial<Lead> }>(
      {
        query: ({ userId, body }) => ({
          url: `?userId=${userId}`,
          method: "POST",
          body,
        }),
      }
    ),
    updateLead: builder.mutation<
      Lead,
      { id: string; userId: string; body: Partial<Lead> }
    >({
      query: ({ id, userId, body }) => ({
        url: `${id}?userId=${userId}`,
        method: "PATCH",
        body,
      }),
    }),
    deleteLead: builder.mutation<void, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `${id}?userId=${userId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadsByUserQuery,
  useGetLeadsByWorkspaceQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} = leadsApis;
