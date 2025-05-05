"use client";



interface Props {
  workspace: Workspace;
  revenue: number;
  roc: number;
  count: number;
  qualified: number;
  webhooks: any[];
}

export default function DashboardContent({
  workspace,
  revenue,
  roc,
  count,
  qualified,
  webhooks,
}: Props) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome to {workspace.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={revenue} />
        <StatCard label="ROC" value={roc} />
        <StatCard label="Participants" value={count} />
        <StatCard label="Qualified" value={qualified} />
      </div>

      <WebhookList webhooks={webhooks} />
    </div>
  );
}
