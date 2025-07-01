import { Notification, NotificationStore, NotificationType } from '@/types/notifications';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';

// Datos iniciales para demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Alerta de Seguridad',
    description: 'Se detectó un acceso desde un nuevo dispositivo en Buenos Aires. Si no fuiste tú, revisa tu cuenta inmediatamente.',
    type: 'security',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: false,
    priority: 'high',
    data: { location: 'Buenos Aires', device: 'iPhone 14' },
  },
  {
    id: '2',
    title: 'Transferencia Realizada',
    description: 'Se procesó exitosamente tu transferencia por $45,000 ARS a María García.',
    type: 'transaction',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    priority: 'medium',
    data: { amount: 45000, recipient: 'María García', reference: 'TXN-2024-001' },
  },
  {
    id: '3',
    title: 'Nueva Promoción',
    description: '¡Obtén hasta 5% de descuento en todas tus transferencias durante enero!',
    type: 'promotion',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
    priority: 'medium',
    data: { discount: 5, validUntil: '2024-01-31' },
  },
  {
    id: '4',
    title: 'Mantenimiento Programado',
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
  hasNewNotificationsAvailable: boolean;
  lastRefreshTime: Date | null;
  pendingServerNotifications: Notification[];
  checkingInterval: NodeJS.Timeout | null;
  autoNotificationsInterval: NodeJS.Timeout | null;
  loadNotifications: () => void;
  checkForMissedNotifications: () => Promise<void>;
  checkForNewNotifications: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  dismissNewNotificationsBanner: () => void;
  simulateServerNotification: () => void;
  startAutoChecking: () => void;
  stopAutoChecking: () => void;
  addProgrammedNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  startAutoNotifications: () => void;
  stopAutoNotifications: () => void;
}

export const useNotificationStore = create<ExtendedNotificationStore>((set, get) => {
  return {
    notifications: [],
    unreadCount: 0,
    isLoaded: false,
    hasNewNotificationsAvailable: false,
    lastRefreshTime: null,
    pendingServerNotifications: [],
    checkingInterval: null,
    autoNotificationsInterval: null,

    // Auto-verificación cada 10 segundos
    startAutoChecking: () => {
      const currentState = get();
      
      if (currentState.checkingInterval) {
        return;
      }
      
      const interval = setInterval(() => {
        const state = get();
        if (state.pendingServerNotifications.length > 0 && !state.hasNewNotificationsAvailable) {
          set({ hasNewNotificationsAvailable: true });
        }
      }, 10000);
      
      set({ checkingInterval: interval });
    },

    stopAutoChecking: () => {
      const currentState = get();
      if (currentState.checkingInterval) {
        clearInterval(currentState.checkingInterval);
        set({ checkingInterval: null });
      }
    },

    // Revisar notificaciones perdidas del background
    checkForMissedNotifications: async () => {
      try {
        const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
        
        if (presentedNotifications.length > 0) {
          const currentState = get();
          let addedCount = 0;
          
          for (const notification of presentedNotifications) {
            const { title, body, data } = notification.request.content;
            const identifier = notification.request.identifier;
            
            // Verificar duplicados por identifier o título/tiempo
            const existsInMain = currentState.notifications.some(n => 
              (data?.identifier && n.data?.identifier === data.identifier) ||
              (n.title === title && Math.abs(n.timestamp.getTime() - notification.date) < 3000)
            );
            
            const existsInPending = currentState.pendingServerNotifications.some(n => 
              (data?.identifier && n.data?.identifier === data.identifier) ||
              (n.title === title && Math.abs(n.timestamp.getTime() - notification.date) < 3000)
            );
            
            if (!existsInMain && !existsInPending) {
              const newNotification: Notification = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: title || 'Nueva Notificación',
                description: body || 'Has recibido una nueva notificación',
                type: (data?.type as any) || 'system',
                priority: (data?.priority as any) || 'medium',
                timestamp: new Date(notification.date),
                isRead: false,
                data: data ? { ...data, identifier } : { identifier },
              };

              // Las notificaciones perdidas van directo al listado
              set((state) => ({
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
              }));
              
              addedCount++;
            }
          }
          
          // Limpiar notificaciones del sistema
          if (addedCount > 0) {
            try {
              await Notifications.dismissAllNotificationsAsync();
            } catch (error) {
              // Silenciar error de limpieza
            }
          }
        }
        
      } catch (error) {
        // Silenciar errores de verificación
      }
    },

    // Cargar datos iniciales
    loadNotifications: () => {
      const currentState = get();
      
      if (currentState.isLoaded) {
        return;
      }
      
      const unreadCount = mockNotifications.filter(n => !n.isRead).length;
      
      set({
        notifications: mockNotifications,
        unreadCount,
        isLoaded: true,
        lastRefreshTime: new Date(),
      });
      
      // Iniciar verificaciones automáticas
      setTimeout(() => {
        get().checkForMissedNotifications();
        get().startAutoChecking();
        get().startAutoNotifications();
      }, 1000);
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
    },

    // Para notificaciones programadas (van a pending)
    addProgrammedNotification: (notification) => {
      const currentState = get();
      const identifier = notification.data?.identifier;
      
      if (identifier) {
        const existsInMain = currentState.notifications.some(n => 
          n.data?.identifier === identifier
        );
        
        const existsInPending = currentState.pendingServerNotifications.some(n => 
          n.data?.identifier === identifier
        );
        
        if (existsInMain || existsInPending) {
          return;
        }
      }
      
      // Usar timestamp programado o actual
      const scheduledTimestamp = notification.data?.scheduledFor || 
                                notification.data?.originalTimestamp || 
                                Date.now();
      
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(scheduledTimestamp),
        isRead: false,
      };

      set((state) => ({
        pendingServerNotifications: [...state.pendingServerNotifications, newNotification],
        hasNewNotificationsAvailable: true,
      }));
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
    },

    markAllAsRead: async () => {
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }));
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
    },

    clearAllNotifications: async () => {
      set({
        notifications: [],
        unreadCount: 0,
      });
    },

    checkForNewNotifications: async () => {
      try {
        const currentState = get();
        
        if (currentState.pendingServerNotifications.length > 0 && !currentState.hasNewNotificationsAvailable) {
          set(state => ({
            hasNewNotificationsAvailable: true,
          }));
          return true;
        }
        
        return false;
      } catch (error) {
        return false;
      }
    },

    // Pull-to-refresh: mover pending a main
    refreshNotifications: async () => {
      try {
        const currentState = get();
        
        if (currentState.pendingServerNotifications.length > 0) {
          const newNotifications = currentState.pendingServerNotifications;
          
          set(state => ({
            notifications: [...newNotifications, ...state.notifications],
            unreadCount: state.unreadCount + newNotifications.length,
            hasNewNotificationsAvailable: false,
            lastRefreshTime: new Date(),
            pendingServerNotifications: [],
          }));
        } else {
          set(state => ({
            lastRefreshTime: new Date(),
            hasNewNotificationsAvailable: false,
          }));
        }
        
      } catch (error) {
        // Silenciar errores
      }
    },

    dismissNewNotificationsBanner: () => {
      set(state => ({
        hasNewNotificationsAvailable: false,
      }));
    },

    // Simular notificación del servidor
    simulateServerNotification: () => {
      const types: NotificationType[] = ['security', 'transaction', 'promotion', 'system', 'urgent'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const notificationTemplates = {
        security: {
          title: 'Alerta del Servidor',
          description: 'Nueva alerta de seguridad detectada desde el servidor.',
          priority: 'high' as const,
        },
        transaction: {
          title: 'Transacción del Servidor',
          description: `Nueva transacción procesada: $${(Math.random() * 50000 + 5000).toFixed(0)} ARS.`,
          priority: 'medium' as const,
        },
        promotion: {
          title: 'Promoción del Servidor',
          description: 'Nueva oferta especial disponible desde el servidor.',
          priority: 'medium' as const,
        },
        system: {
          title: 'Actualización del Servidor',
          description: 'Nueva actualización del sistema disponible.',
          priority: 'low' as const,
        },
        urgent: {
          title: 'Urgente del Servidor',
          description: 'Notificación urgente que requiere atención inmediata.',
          priority: 'high' as const,
        },
      };
      
      const template = notificationTemplates[randomType as keyof typeof notificationTemplates];
      const newServerNotification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: template.title,
        description: template.description,
        type: randomType,
        priority: template.priority,
        timestamp: new Date(),
        isRead: false,
        data: { fromServer: true, timestamp: Date.now() },
      };
      
      set(state => ({
        pendingServerNotifications: [...state.pendingServerNotifications, newServerNotification],
        hasNewNotificationsAvailable: true,
      }));
    },

    // Auto-generar notificaciones cada 15 segundos
    startAutoNotifications: () => {
      const currentState = get();
      
      if (currentState.autoNotificationsInterval) {
        return;
      }
      
      const interval = setInterval(() => {
        get().simulateServerNotification();
      }, 15000);
      
      set({ autoNotificationsInterval: interval });
    },

    stopAutoNotifications: () => {
      const currentState = get();
      if (currentState.autoNotificationsInterval) {
        clearInterval(currentState.autoNotificationsInterval);
        set({ autoNotificationsInterval: null });
      }
    },
  };
}); 