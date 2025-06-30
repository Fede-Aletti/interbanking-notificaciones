export type NotificationType = 'security' | 'transaction' | 'system' | 'promotion' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
}

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

export const notificationIcons: Record<NotificationType, string> = {
  security: '🔒',
  transaction: '💳',
  system: '⚙️',
  promotion: '🎉',
  urgent: '🚨',
};

export const notificationColors: Record<NotificationType, string> = {
  security: '#EF4444',
  transaction: '#10B981',
  system: '#6B7280',
  promotion: '#8B5CF6',
  urgent: '#F59E0B',
}; 