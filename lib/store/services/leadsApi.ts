import { leadsApi } from "../base/leadsapi";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "new" | "in_progress" | "closed";
  createdAt: string;
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
    getLead: builder.query<Lead, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/${id}?userId=${userId}`,
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
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} = leadsApis;
