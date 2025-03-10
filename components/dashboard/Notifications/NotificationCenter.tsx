import React from 'react';
import useLeadNotifications from '@/hooks/useLeadNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  workspaceId: string;
  userId: string;
}

export default function NotificationCenter({ workspaceId, userId }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useLeadNotifications(workspaceId, userId);
  console.log('notifications', notifications);
  const formatNotificationMessage = (notification: any) => {
    const { action_type, details } = notification;
    switch (action_type) {
      case 'created':
        return `New lead created: ${details.lead_name}`;
      case 'bulk_created':
        return `${details.count} new leads were imported`;
      case 'data_updated':
        return `Lead "${details.lead_name}" was updated`;
      case 'notes_updated':
        return `Notes were updated for a lead`;
      case 'assigned':
        return `Lead "${details.lead_name}" was assigned to ${details.new_assignee}`;
      case 'leads_deleted':
        return `${details.lead_count} leads were deleted`;
      default:
        return 'Lead action performed';
    }
  };

  return (
    <div className="w-full h-screenoverflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No notifications available
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="text-gray-800">
                    {formatNotificationMessage(notification)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}