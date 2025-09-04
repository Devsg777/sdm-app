import { NotificationService } from '@/services/notification';
import { useAuth } from '@/contexts/AuthContext';
import { create } from 'zustand';
import { useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ notifications: [] });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const notifications = await NotificationService.getUserNotifications(user.id);
      
      set({
        notifications,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },
  
  fetchUnreadCount: async () => {
    const { user } = useAuth();
    
    if (!user) {
      set({ unreadCount: 0 });
      return;
    }
    
    try {
      const count = await NotificationService.getUnreadNotificationsCount(user.id);
      
      set({ unreadCount: count });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const success = await NotificationService.markNotificationAsRead(notificationId);
      
      if (success) {
        set((state) => ({
          notifications: state.notifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to mark notification as read',
        isLoading: false,
      });
      return false;
    }
  },
  
  markAllAsRead: async () => {
    const { user } = useAuth();
    
    if (!user) {
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const success = await NotificationService.markAllNotificationsAsRead(user.id);
      
      if (success) {
        set((state) => ({
          notifications: state.notifications.map(notification => ({ ...notification, is_read: true })),
          unreadCount: 0,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to mark all notifications as read',
        isLoading: false,
      });
      return false;
    }
  },
  
  deleteNotification: async (notificationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const success = await NotificationService.deleteNotification(notificationId);
      
      if (success) {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          const unreadCount = notification && !notification.is_read 
            ? state.unreadCount - 1 
            : state.unreadCount;
            
          return {
            notifications: state.notifications.filter(n => n.id !== notificationId),
            unreadCount: Math.max(0, unreadCount),
            isLoading: false,
          };
        });
      } else {
        set({ isLoading: false });
      }
      
      return success;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete notification',
        isLoading: false,
      });
      return false;
    }
  },
}));

export const useNotifications = () => {
  const store = useNotificationStore();
  
  // Initialize notifications when the hook is first used
  useEffect(() => {
    store.fetchNotifications();
    store.fetchUnreadCount();
    
    // Set up a refresh interval
    const intervalId = setInterval(() => {
      store.fetchUnreadCount();
    }, 60000); // Check for new notifications every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  return store;
};