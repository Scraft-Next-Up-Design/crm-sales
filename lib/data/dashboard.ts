import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cache } from "react";

type Lead = {
  status: "in_progress" | "closed";
  created_at: string;
};

type LeadTrend = {
  name: string;
  leads: number;
};

type LeadWithStatus = Pick<Lead, "status">;
type LeadWithCreatedAt = Pick<Lead, "created_at">;

// Create a cached Supabase client for server components
const createCachedSupabaseClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
});

export async function getLeadStats() {
  const supabase = createCachedSupabaseClient();

  // Fetch leads with a 5-minute cache duration
  const { data: leads, error } = await supabase
    .from("leads")
    .select("status")
    .order("created_at", { ascending: false })
    .limit(1000)
    .returns<LeadWithStatus[]>()
    .then((result) => ({ ...result, data: result.data || [] }));

  if (error) {
    console.error("Error fetching lead stats:", error);
    return {
      total: 0,
      active: 0,
      closed: 0,
    };
  }

  return {
    total: leads.length,
    active: leads.filter((lead) => lead.status === "in_progress").length,
    closed: leads.filter((lead) => lead.status === "closed").length,
  };
}

export async function getLeadTrends() {
  const supabase = createCachedSupabaseClient();

  // Get the date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Fetch leads created in the last 6 months with a 15-minute cache duration
  const { data: leads, error } = await supabase
    .from("leads")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true })
    .returns<LeadWithCreatedAt[]>()
    .then((result) => ({ ...result, data: result.data || [] }));

  if (error) {
    console.error("Error fetching lead trends:", error);
    return [];
  }

  // Group leads by month
  const trends = leads.reduce(
    (acc: { [key: string]: number }, lead: LeadWithCreatedAt) => {
      const month = new Date(lead.created_at).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {}
  );

  // Convert to array format and ensure type safety
  return Object.entries(trends).map(
    ([name, leads]): LeadTrend => ({
      name,
      leads,
    })
  );
}
