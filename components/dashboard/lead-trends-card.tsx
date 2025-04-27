import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeadTrend = {
  name: string;
  leads: number;
};

export async function LeadTrendsCard({
  promise,
}: {
  promise: Promise<LeadTrend[]>;
}) {
  const trends = await promise;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <div className="flex h-full items-end gap-2">
            {trends.map((trend) => (
              <div
                key={trend.name}
                className="relative flex h-full flex-col justify-end"
                style={{ flex: "1" }}
              >
                <div
                  className="bg-primary w-full rounded-sm"
                  style={{
                    height: `${
                      (trend.leads / Math.max(...trends.map((t) => t.leads))) *
                      100
                    }%`,
                  }}
                />
                <span className="mt-2 text-sm text-center">{trend.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
