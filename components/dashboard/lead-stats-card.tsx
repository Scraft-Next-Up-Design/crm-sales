import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeadStats = {
  total: number;
  active: number;
  closed: number;
};

export async function LeadStatsCard({
  promise,
}: {
  promise: Promise<LeadStats>;
}) {
  const stats = await promise;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closed Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.closed}</div>
        </CardContent>
      </Card>
    </div>
  );
}
