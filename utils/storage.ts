import { Notification } from '@/types/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@interbanking_notifications';

export interface PersistedNotificationData {
  notifications: Notification[];
  unreadCount: number;
}

export const storageUtils = {
  // Guardar notificaciones en AsyncStorage
  async saveNotifications(data: PersistedNotificationData): Promise<void> {
    try {
      // Serializar las fechas como ISO strings
      const serializedData = {
        ...data,
        notifications: data.notifications.map(notification => ({
          ...notification,
          timestamp: notification.timestamp.toISOString(),
        })),
      };
      
      const jsonValue = JSON.stringify(serializedData);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving notifications to AsyncStorage:', error);
    }
  },

  // Cargar notificaciones desde AsyncStorage
  async loadNotifications(): Promise<PersistedNotificationData | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (jsonValue === null) {
        return null;
      }

      const parsedData = JSON.parse(jsonValue);
      
      // Deserializar las fechas desde ISO strings
      const data: PersistedNotificationData = {
        ...parsedData,
        notifications: parsedData.notifications.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
        })),
      };

      return data;
    } catch (error) {
      console.error('Error loading notifications from AsyncStorage:', error);
      return null;
    }
  },

  // Limpiar todas las notificaciones del storage
  async clearNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Error clearing notifications from AsyncStorage:', error);
    }
  },

  // Verificar si hay datos guardados
  async hasStoredNotifications(): Promise<boolean> {
    try {
      const jsonValue = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return jsonValue !== null;
    } catch (error) {
      console.error('Error checking stored notifications:', error);
      return false;
    }
  },
}; 