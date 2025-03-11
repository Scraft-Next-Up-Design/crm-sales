import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Bell, BellOff, CheckCircle, AlertCircle, UserPlus, Trash, Edit, FileText } from 'lucide-react';
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
  read: boolean;
  lead_source_id: string | null;
  related_user_id: string | null;
}

interface NotificationCenterProps {
  workspaceId: string;
  userId: string;
}

export default function NotificationCenter({ workspaceId, userId }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useLeadNotifications(workspaceId, userId);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [expandedNotification, setExpandedNotification] = useState<number | null>(null);

  // Initialize with filter states
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'deleted', label: 'Deleted' },
  ];

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
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

  // Format notification message with more detail
  const formatNotificationMessage = (notification: Notification) => {
    const { action_type, details } = notification;
    
    switch (action_type) {
      case 'created':
        return `New lead created: ${details.lead_name}`;
      
      case 'bulk_created':
        return `${details.count} new leads were imported`;
      
      case 'data_updated':
        if (details.changes && Object.keys(details.changes).length > 0) {
          if (details.changes.name) {
            return `Lead "${details.changes.name.old}" was renamed to "${details.changes.name.new}"`;
          }
          const changedFields = Object.keys(details.changes).join(', ');
          return `Lead "${details.lead_name}" was updated (${changedFields})`;
        }
        return `Lead "${details.lead_name}" was updated`;
      
      case 'notes_updated':
        return `Notes were updated for lead "${details.lead_name}"`;
      
      case 'assigned':
        const newAssigneeName = details.new_assignee?.name || 'Unassigned';
        const prevAssigneeName = details.previous_assignee?.name || 'Unassigned';
        return `Lead "${details.lead_name}" was reassigned from ${prevAssigneeName} to ${newAssigneeName}`;
      
      case 'leads_deleted':
        if (details.lead_count === 1 && details.lead_names && details.lead_names.length > 0) {
          return `Lead "${details.lead_names[0]}" was deleted`;
        }
        return `${details.lead_count} leads were deleted`;
      
      default:
        return 'Lead action performed';
    }
  };

  // Format notification detail section with expanded information
  const renderNotificationDetails = (notification: Notification) => {
    const { action_type, details } = notification;
    
    if (action_type.includes('deleted') && details.lead_names && details.lead_names.length > 0) {
      return (
        <div className="mt-2 text-sm text-gray-600">
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
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-medium mb-1">Changes:</p>
          <ul className="list-disc pl-5">
            {Object.entries(details.changes).map(([field, values], index) => (
              <li key={index}>
                <span className="font-medium">{field}:</span> {String(values.old)} → {String(values.new)}
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
    <div className="w-full h-screen overflow-y-auto ">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Bell className="mr-2 h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BellOff className="mr-2 h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : ' text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
                {option.value === 'unread' && unreadCount > 0 && (
                  <span className="ml-1">{`(${unreadCount})`}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No notifications found</h3>
              <p className="mt-1">
                {filter !== 'all' 
                  ? `No ${filter} notifications to display` 
                  : 'You don\'t have any notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 text-white rounded-lg border hover:shadow-md transition-shadow ${
                  !notification.read ? ' border-blue-200' : ' border-gray-200'
                }`}
              >
                <div 
                  className="flex cursor-pointer"
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id);
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
                      <p className={`text-white ${!notification.read ? 'font-medium' : ''}`}>
                        {formatNotificationMessage(notification)}
                      </p>
                      
                      <div className="flex flex-col items-end ml-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
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
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
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