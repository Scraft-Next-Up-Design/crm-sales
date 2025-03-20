import useSWR from "swr";

interface LeadTrend {
  name: string;
  leads: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch lead trends");
  }
  return response.json();
};

export function useLeadTrendsData() {
  const { data, error, isLoading } = useSWR<LeadTrend[]>(
    "/api/leads/trends",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000,
      dedupingInterval: 60000, 
    }
  );

  return {
    data: data || [],
    isLoading,
    isError: error,
  };
}
