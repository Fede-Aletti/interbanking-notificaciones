import { Notification, NotificationStore } from '@/types/notifications';
import { storageUtils } from '@/utils/storage';
import { create } from 'zustand';

// Mock notifications for demo - solo se usan si no hay datos guardados
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '🔒 Alerta de Seguridad',
    description: 'Se detectó un acceso desde un nuevo dispositivo en Buenos Aires. Si no fuiste tú, revisa tu cuenta inmediatamente.',
    type: 'security',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: false,
    priority: 'high',
    data: { location: 'Buenos Aires', device: 'iPhone 14' },
  },
  {
    id: '2',
    title: '💳 Transferencia Realizada',
    description: 'Se procesó exitosamente tu transferencia por $45,000 ARS a María García.',
    type: 'transaction',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    priority: 'medium',
    data: { amount: 45000, recipient: 'María García', reference: 'TXN-2024-001' },
  },
  {
    id: '3',
    title: '🎉 Nueva Promoción',
    description: '¡Obtén hasta 5% de descuento en todas tus transferencias durante enero!',
    type: 'promotion',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
    priority: 'medium',
    data: { discount: 5, validUntil: '2024-01-31' },
  },
  {
    id: '4',
    title: '⚙️ Mantenimiento Programado',
    description: 'El sistema estará en mantenimiento el domingo 14/01 de 2:00 a 4:00 AM.',
    type: 'system',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    priority: 'low',
    data: { maintenanceDate: '2024-01-14', startTime: '02:00', endTime: '04:00' },
  },
];

interface ExtendedNotificationStore extends NotificationStore {
  isLoaded: boolean;
  loadNotifications: () => Promise<void>;
}

export const useNotificationStore = create<ExtendedNotificationStore>((set, get) => {
  // Función helper para persistir estado actual
  const persistState = async () => {
    const state = get();
    await storageUtils.saveNotifications({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
    });
  };

  return {
    notifications: [],
    unreadCount: 0,
    isLoaded: false,

    // Cargar notificaciones desde AsyncStorage
    loadNotifications: async () => {
      try {
        const storedData = await storageUtils.loadNotifications();
        
        if (storedData) {
          // Cargar datos guardados
          set({
            notifications: storedData.notifications,
            unreadCount: storedData.unreadCount,
            isLoaded: true,
          });
        } else {
          // Primera vez - usar datos mock y guardarlos
          const unreadCount = mockNotifications.filter(n => !n.isRead).length;
          set({
            notifications: mockNotifications,
            unreadCount,
            isLoaded: true,
          });
          
          // Guardar los datos mock para la próxima vez
          await storageUtils.saveNotifications({
            notifications: mockNotifications,
            unreadCount,
          });
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback a datos mock en caso de error
        const unreadCount = mockNotifications.filter(n => !n.isRead).length;
        set({
          notifications: mockNotifications,
          unreadCount,
          isLoaded: true,
        });
      }
    },

    addNotification: async (notification) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        isRead: false,
      };

      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      // Persistir cambios
      await persistState();
    },

    markAsRead: async (id) => {
      set((state) => {
        const updatedNotifications = state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        );
        
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      });

      // Persistir cambios
      await persistState();
    },

    markAllAsRead: async () => {
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }));

      // Persistir cambios
      await persistState();
    },

    deleteNotification: async (id) => {
      set((state) => {
        const updatedNotifications = state.notifications.filter(
          (notification) => notification.id !== id
        );
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      });

      // Persistir cambios
      await persistState();
    },

    clearAllNotifications: async () => {
      set({
        notifications: [],
        unreadCount: 0,
      });

      // Limpiar AsyncStorage completamente
      await storageUtils.clearNotifications();
    },
  };
}); 