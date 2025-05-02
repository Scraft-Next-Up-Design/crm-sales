import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface ROCData {
  top_source_id: string;
  monthly_stats: Array<{
    month: string;
    convertedLeads: number;
  }>;
  conversion_rate: number;
}

interface DashboardData {
  workspaceRevenue: any;
  ROC: ROCData;
  qualifiedCount: {
    qualifiedLeadsCount: number;
  };
  workspaceCount: {
    arrivedLeadsCount: number;
  };
  webhooks: {
    name: string;
  };
}

const cache = new Map<
  string,
  {
    data: DashboardData;
    timestamp: number;
    pendingPromise?: Promise<DashboardData>;
  }
>();

const CACHE_TTL = 60 * 1000;
const STALE_TTL = 5 * 60 * 1000;

async function fetchDashboardData(workspaceId: string): Promise<DashboardData> {
  const cached = cache.get(workspaceId);
  if (cached?.pendingPromise) {
    return cached.pendingPromise;
  }

  const promise = (async () => {
    try {
      const rocResponse = await fetch(
        `${process.env.API_URL}/workspace/${workspaceId}/roc`
      );
      const rocData: ROCData = await rocResponse.json();

      const [workspaceRevenue, qualifiedCount, workspaceCount, webhooks] =
        await Promise.all([
          fetch(`${process.env.API_URL}/workspace/${workspaceId}/revenue`, {
            signal: AbortSignal.timeout(5000),
          }).then((res) => res.json()),
          fetch(`${process.env.API_URL}/workspace/${workspaceId}/qualified`, {
            signal: AbortSignal.timeout(5000),
          }).then((res) => res.json()),
          fetch(`${process.env.API_URL}/workspace/${workspaceId}/count`, {
            signal: AbortSignal.timeout(5000),
          }).then((res) => res.json()),
          fetch(
            `${process.env.API_URL}/webhooks/${workspaceId}/${rocData.top_source_id}`,
            { signal: AbortSignal.timeout(5000) }
          ).then((res) => res.json()),
        ]);

      const dashboardData: DashboardData = {
        workspaceRevenue,
        ROC: rocData,
        qualifiedCount,
        workspaceCount,
        webhooks,
      };

      cache.set(workspaceId, {
        data: dashboardData,
        timestamp: Date.now(),
      });

      return dashboardData;
    } catch (error) {
      const cached = cache.get(workspaceId);
      if (cached) {
        cached.pendingPromise = undefined;
      }
      throw error;
    }
  })();

  if (cached) {
    cached.pendingPromise = promise;
  } else {
    cache.set(workspaceId, {
      data: {} as DashboardData,
      timestamp: 0,
      pendingPromise: promise,
    });
  }

  return promise;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = params;
    const cached = cache.get(workspaceId);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ data: cached.data });
    }

    if (cached && Date.now() - cached.timestamp < STALE_TTL) {
      fetchDashboardData(workspaceId).catch(console.error);
      return NextResponse.json({ data: cached.data });
    }

    const dashboardData = await fetchDashboardData(workspaceId);
    return NextResponse.json({ data: dashboardData });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
