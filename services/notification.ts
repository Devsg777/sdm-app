import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

/**
 * Service for handling notification operations
 */
export const NotificationService = {
  /**
   * Get notifications for a user
   * @param userId User ID
   * @returns Array of notifications
   */
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  },

  /**
   * Get unread notifications count for a user
   * @param userId User ID
   * @returns Number of unread notifications
   */
  getUnreadNotificationsCount: async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      return 0;
    }
  },

  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @returns boolean indicating success
   */
  markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns boolean indicating success
   */
  markAllNotificationsAsRead: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  /**
   * Delete a notification
   * @param notificationId Notification ID
   * @returns boolean indicating success
   */
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  /**
   * Create a notification
   * @param notification Notification data
   * @returns The created notification or null if there was an error
   */
  createNotification: async (notification: NotificationInsert): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  /**
   * Create a booking notification
   * @param userId User ID
   * @param bookingId Booking ID
   * @param title Notification title
   * @param message Notification message
   * @param type Notification type
   * @returns The created notification or null if there was an error
   */
  createBookingNotification: async (
    userId: string,
    bookingId: string,
    title: string,
    message: string,
    type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'driver_assigned' | 'driver_arrived' | 'ride_started' | 'ride_completed' | 'payment_received'
  ): Promise<Notification | null> => {
    try {
      return await NotificationService.createNotification({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
        data: { booking_id: bookingId },
      });
    } catch (error) {
      console.error('Error creating booking notification:', error);
      return null;
    }
  },

  /**
   * Create a payment notification
   * @param userId User ID
   * @param paymentId Payment ID
   * @param title Notification title
   * @param message Notification message
   * @param type Notification type
   * @returns The created notification or null if there was an error
   */
  createPaymentNotification: async (
    userId: string,
    paymentId: string,
    title: string,
    message: string,
    type: 'payment_success' | 'payment_failed' | 'refund_initiated' | 'refund_completed'
  ): Promise<Notification | null> => {
    try {
      return await NotificationService.createNotification({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
        data: { payment_id: paymentId },
      });
    } catch (error) {
      console.error('Error creating payment notification:', error);
      return null;
    }
  },

  /**
   * Create a promotional notification
   * @param userId User ID
   * @param title Notification title
   * @param message Notification message
   * @param data Additional data
   * @returns The created notification or null if there was an error
   */
  createPromotionalNotification: async (
    userId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification | null> => {
    try {
      return await NotificationService.createNotification({
        user_id: userId,
        title,
        message,
        type: 'promotional',
        is_read: false,
        data,
      });
    } catch (error) {
      console.error('Error creating promotional notification:', error);
      return null;
    }
  },

  /**
   * Send push notification
   * @param userId User ID
   * @param title Notification title
   * @param body Notification body
   * @param data Additional data
   * @returns boolean indicating success
   */
  sendPushNotification: async (
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> => {
    try {
      // Get user's push token
      const { data: userData, error: userError } = await supabase
        .from('user_devices')
        .select('push_token')
        .eq('user_id', userId)
        .order('last_used', { ascending: false })
        .limit(1)
        .single();

      if (userError || !userData) {
        console.error('Error getting user push token:', userError);
        return false;
      }

      const pushToken = userData.push_token;

      if (!pushToken) {
        console.error('User has no push token');
        return false;
      }

      // In a real implementation, this would call a push notification service
      // For now, we'll just log the notification
      console.log('Sending push notification:', {
        to: pushToken,
        title,
        body,
        data,
      });

      // Create a notification record in the database
      await NotificationService.createNotification({
        user_id: userId,
        title,
        message: body,
        type: 'push',
        is_read: false,
        data,
      });

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  },
};

export default NotificationService;