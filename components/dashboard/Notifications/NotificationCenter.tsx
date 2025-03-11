import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Bell, CheckCircle, AlertCircle, UserPlus, Trash, Edit, FileText } from 'lucide-react';
import useLeadNotifications from '@/hooks/useLeadNotifications';

interface NotificationDetails {
  lead_id?: string;
  lead_name?: string;
  lead_email?: string;
  lead_count?: number;
  lead_names?: string[];
  lead_ids?: number[];
  deleted_by?: string;
  updated_by?: string;
  updated_by_name?: string;
  actor_name?: string;
  assigned_by?: string;
  previous_assignee?: { name: string; role: string } | null;
  new_assignee?: { name: string; role: string } | null;
  count?: number;
  changes?: Record<string, { old: any; new: any }>;
}

interface Notification {
  id: number;
  created_at: string;
  lead_id: string;
  action_type: string;
  user_id: string;
  workspace_id: string;
  details: NotificationDetails;
  lead_source_id: string | null;
  related_user_id: string | null;
}

interface NotificationCenterProps {
  workspaceId: string;
  userId: string;
}

export default function NotificationCenter({ workspaceId, userId }: NotificationCenterProps) {
  const { notifications } = useLeadNotifications();
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [expandedNotification, setExpandedNotification] = useState<number | null>(null);

  // Initialize with filter states
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'deleted', label: 'Deleted' },
  ];

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    return notification.action_type.includes(filter);
  });

  // Get appropriate icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (true) {
      case type.includes('created'):
        return <CheckCircle className="text-green-500" />;
      case type.includes('updated') || type.includes('data_updated'):
        return <Edit className="text-blue-500" />;
      case type.includes('assigned'):
        return <UserPlus className="text-purple-500" />;
      case type.includes('deleted'):
        return <Trash className="text-red-500" />;
      case type.includes('notes'):
        return <FileText className="text-yellow-500" />;
      default:
        return <AlertCircle className="text-gray-500" />;
    }
  };

  // Get the performer name from notification details
  const getPerformerName = (notification: Notification) => {
    const { details } = notification;    
    const performerName = details.actor_name || 
                          details.updated_by_name || 
                          details.assigned_by || 
                          details.deleted_by || 
                          'Unknown user';
    
    return performerName !== 'Unknown user' && performerName 
      ? performerName 
      : 'Unknown user';
  };

  // Format notification message with more detail
  const formatNotificationMessage = (notification: Notification) => {
    const { action_type, details } = notification;
    const performerName = getPerformerName(notification);
    
    switch (action_type) {
      case 'created':
        return `${performerName} created a new lead: ${details.lead_name}`;
      
      case 'bulk_created':
        return `${performerName} imported ${details.count} new leads`;
      
      case 'data_updated':
        if (details.changes && Object.keys(details.changes).length > 0) {
          if (details.changes.name) {
            return `${performerName} renamed lead "${details.changes.name.old}" to "${details.changes.name.new}"`;
          }
          const changedFields = Object.keys(details.changes).join(', ');
          return `${performerName} updated lead "${details.lead_name}" (${changedFields})`;
        }
        return `${performerName} updated lead "${details.lead_name}"`;
      
      case 'notes_updated':
        return `${performerName} updated notes for lead "${details.lead_name}"`;
      
      case 'assigned':
        const newAssigneeName = details.new_assignee?.name || 'Unassigned';
        const prevAssigneeName = details.previous_assignee?.name || 'Unassigned';
        return `${performerName} reassigned lead "${details.lead_name}" from ${prevAssigneeName} to ${newAssigneeName}`;
      
      case 'leads_deleted':
        if (details.lead_count === 1 && details.lead_names && details.lead_names.length > 0) {
          return `${performerName} deleted lead "${details.lead_names[0]}"`;
        }
        return `${performerName} deleted ${details.lead_count} leads`;
      
      default:
        return `${performerName} performed an action on a lead`;
    }
  };

  // Format notification detail section with expanded information
  const renderNotificationDetails = (notification: Notification) => {
    const { action_type, details } = notification;
    
    if (action_type.includes('deleted') && details.lead_names && details.lead_names.length > 0) {
      return (
        <div className="mt-2 text-sm text-gray-300">
          <p className="font-medium mb-1">Deleted leads:</p>
          <ul className="list-disc pl-5">
            {details.lead_names.slice(0, 5).map((name, index) => (
              <li key={index}>{name}</li>
            ))}
            {details.lead_names.length > 5 && (
              <li className="italic">and {details.lead_names.length - 5} more...</li>
            )}
          </ul>
        </div>
      );
    }
    
    if (action_type === 'data_updated' && details.changes) {
      return (
        <div className="mt-2 text-sm text-gray-300">
          <p className="font-medium mb-1">Changes:</p>
          <ul className="list-disc pl-5">
            {Object.entries(details.changes).map(([field, values], index) => (
              <li key={index}>
                <span className="font-medium">{field}:</span> {String(values.old || '-')} → {String(values.new || '-')}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    return null;
  };

  // Handle load more functionality
  const handleLoadMore = () => {
    setIsLoading(true);
    // Here you would implement your pagination loading logic
    // For now, we'll simulate it with a timeout
    setTimeout(() => {
      setPage(page + 1);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Bell className="mr-2 h-6 w-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <Bell className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white">No notifications found</h3>
              <p className="mt-1 text-gray-400">
                {filter !== 'all' 
                  ? `No ${filter} notifications to display` 
                  : 'No notifications to display at the moment'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:shadow-md transition-shadow"
              >
                <div 
                  className="flex cursor-pointer"
                  onClick={() => {
                    setExpandedNotification(
                      expandedNotification === notification.id ? null : notification.id
                    );
                  }}
                >
                  <div className="mr-4 mt-1">
                    {getNotificationIcon(notification.action_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-white">
                        {formatNotificationMessage(notification)}
                      </p>
                      
                      <div className="flex flex-col items-end ml-2">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    
                    {expandedNotification === notification.id && renderNotificationDetails(notification)}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {filteredNotifications.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-4 py-2 text-blue-400 border border-blue-600 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}