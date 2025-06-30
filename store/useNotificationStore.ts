import { Notification, NotificationStore } from '@/types/notifications';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';

// Mock notifications for demo - se cargan siempre al inicializar
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
  loadNotifications: () => void;
  checkForMissedNotifications: () => Promise<void>;
}

export const useNotificationStore = create<ExtendedNotificationStore>((set, get) => {
  return {
    notifications: [],
    unreadCount: 0,
    isLoaded: false,

    // Verificar notificaciones que llegaron en background
    checkForMissedNotifications: async () => {
      try {
        console.log('🔍 Verificando notificaciones presentadas...');
        
        // Obtener notificaciones que están actualmente en la bandeja de notificaciones
        const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
        
        if (presentedNotifications.length > 0) {
          console.log(`📥 Encontradas ${presentedNotifications.length} notificaciones presentadas`);
          
          const currentState = get();
          let addedCount = 0;
          
          for (const notification of presentedNotifications) {
            const { title, body, data } = notification.request.content;
            
            // Verificar si ya existe en nuestro store para evitar duplicados
            const exists = currentState.notifications.some(n => 
              n.title === title && 
              Math.abs(n.timestamp.getTime() - notification.date) < 10000 // 10 segundos de diferencia
            );
            
            if (!exists) {
              console.log('➕ Agregando notificación perdida:', title);
              
              const newNotification: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: title || 'Nueva Notificación',
                description: body || 'Has recibido una nueva notificación',
                type: (data?.type as any) || 'system',
                priority: (data?.priority as any) || 'medium',
                timestamp: new Date(notification.date),
                isRead: false,
                data: data || {},
              };

              // Agregar al estado
              set((state) => ({
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
              }));
              
              addedCount++;
            }
          }
          
          if (addedCount > 0) {
            console.log(`✅ Se agregaron ${addedCount} notificaciones perdidas`);
          }
        }
        
      } catch (error) {
        console.error('❌ Error checking missed notifications:', error);
      }
    },

    // Cargar notificaciones (ahora solo datos mock)
    loadNotifications: () => {
      console.log('🔄 Cargando notificaciones mock...');
      const unreadCount = mockNotifications.filter(n => !n.isRead).length;
      
      set({
        notifications: mockNotifications,
        unreadCount,
        isLoaded: true,
      });
      
      console.log('✅ Notificaciones mock cargadas:', mockNotifications.length);
      
      // Después de cargar, verificar notificaciones perdidas
      const checkMissed = get().checkForMissedNotifications;
      checkMissed();
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

      console.log('✅ Notificación agregada:', newNotification.title);
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

      console.log('📖 Notificación marcada como leída:', id);
    },

    markAllAsRead: async () => {
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }));

      console.log('📖 Todas las notificaciones marcadas como leídas');
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

      console.log('🗑️ Notificación eliminada:', id);
    },

    clearAllNotifications: async () => {
      set({
        notifications: [],
        unreadCount: 0,
      });

      console.log('🧹 Todas las notificaciones limpiadas');
    },
  };
}); 