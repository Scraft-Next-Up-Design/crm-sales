import React from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetWebhooksBySourceIdQuery } from "@/lib/store/services/webhooks"; // Adjust the import path

interface WebhookStatusProps {
  sourceId: string | null;
  workspaceId: string;
}

const WebhookStatus: React.FC<WebhookStatusProps> = ({
  sourceId,
  workspaceId,
}) => {
  const {
    data: webhooks,
    isLoading,
    isError,
  } = useGetWebhooksBySourceIdQuery(
    sourceId && workspaceId ? { id: sourceId, workspaceId } : skipToken
  );

  console.log("Fetched Webhooks:", webhooks);

  if (isLoading) return <span>Loading...</span>;
  if (isError) return <span>Error fetching webhooks</span>;

  // Define background colors for different types
  const typeColors: Record<string, string> = {
    google: "bg-blue-500 text-white dark:bg-blue-400",
    shopify: "bg-green-500 text-white dark:bg-green-400",
    wordpress: "bg-purple-500 text-white dark:bg-purple-400",
    default: "bg-gray-500 text-white dark:bg-gray-400",
  };

  const type = webhooks?.type?.toLowerCase() || "default";
  const typeClass = typeColors[type] || typeColors.default;

  return (
    <div className="p-2">
      {webhooks ? (
        <span
          className={`px-3 py-1 rounded-md text-sm font-semibold ${typeClass}`}
        >
          {webhooks.type}
        </span>
      ) : (
        <span className="px-3 py-1 rounded-md text-sm font-semibold bg-gray-300 dark:bg-gray-600">
          No Platform Found
        </span>
      )}
    </div>
  );
};

export default WebhookStatus;
