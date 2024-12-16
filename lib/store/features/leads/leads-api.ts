import { api } from '../../api';
import type { Lead } from './types';

export const leadsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<Lead[], void>({
      query: () => 'leads',
      providesTags: ['Leads'],
    }),
    getLead: builder.query<Lead, string>({
      query: (id) => `leads/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Leads', id }],
    }),
    createLead: builder.mutation<Lead, Partial<Lead>>({
      query: (body) => ({
        url: 'leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLead: builder.mutation<Lead, { id: string; body: Partial<Lead> }>({
      query: ({ id, body }) => ({
        url: `leads/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Leads', id }],
    }),
    deleteLead: builder.mutation<void, string>({
      query: (id) => ({
        url: `leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leads'],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} = leadsApi;