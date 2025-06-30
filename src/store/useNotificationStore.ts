import { Notification, NotificationStore, NotificationType } from '@/types/notifications';
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
  hasNewNotificationsAvailable: boolean;
  lastRefreshTime: Date | null;
  pendingServerNotifications: Notification[]; // Notificaciones del servidor pendientes
  checkingInterval: NodeJS.Timeout | null; // Timer para verificación automática
  autoNotificationsInterval: NodeJS.Timeout | null; // Timer para notificaciones automáticas
  loadNotifications: () => void;
  checkForMissedNotifications: () => Promise<void>;
  checkForNewNotifications: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  dismissNewNotificationsBanner: () => void;
  simulateServerNotification: () => void; // Nueva función para simular notificaciones del servidor
  startAutoChecking: () => void; // Iniciar verificación automática
  stopAutoChecking: () => void; // Detener verificación automática
  addProgrammedNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void; // Para notificaciones programadas
  startAutoNotifications: () => void; // Iniciar notificaciones automáticas
  stopAutoNotifications: () => void; // Detener notificaciones automáticas
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

    // Iniciar verificación automática cada 10 segundos
    startAutoChecking: () => {
      const currentState = get();
      
      // Si ya hay un timer activo, no crear otro
      if (currentState.checkingInterval) {
        console.log('⏰ Auto-checking ya está activo');
        return;
      }
      
      const interval = setInterval(() => {
        console.log('🔍 Auto-checking: Verificando nuevas notificaciones...');
        const state = get();
        if (state.pendingServerNotifications.length > 0 && !state.hasNewNotificationsAvailable) {
          set({ hasNewNotificationsAvailable: true });
          console.log('📬 Auto-checking: Nuevas notificaciones disponibles');
        }
      }, 10000); // Cada 10 segundos
      
      set({ checkingInterval: interval });
      console.log('⏰ Auto-checking iniciado (cada 10 segundos)');
    },

    // Detener verificación automática
    stopAutoChecking: () => {
      const currentState = get();
      if (currentState.checkingInterval) {
        clearInterval(currentState.checkingInterval);
        set({ checkingInterval: null });
        console.log('⏹️ Auto-checking detenido');
      }
    },

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
            const identifier = notification.request.identifier;
            
            // Mejorar verificación de duplicados - usar identifier si está disponible
            const existsInMain = currentState.notifications.some(n => 
              (data?.identifier && n.data?.identifier === data.identifier) ||
              (n.title === title && Math.abs(n.timestamp.getTime() - notification.date) < 3000)
            );
            
            const existsInPending = currentState.pendingServerNotifications.some(n => 
              (data?.identifier && n.data?.identifier === data.identifier) ||
              (n.title === title && Math.abs(n.timestamp.getTime() - notification.date) < 3000)
            );
            
            if (!existsInMain && !existsInPending) {
              console.log('➕ Agregando notificación perdida:', title);
              
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

              // Las notificaciones perdidas del background van DIRECTAMENTE al listado principal
              set((state) => ({
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
              }));
              
              addedCount++;
            } else {
              console.log('⚠️ Notificación ya existe, saltando:', title);
            }
          }
          
          if (addedCount > 0) {
            console.log(`✅ Se agregaron ${addedCount} notificaciones perdidas al listado principal`);
          }
          
          // Limpiar notificaciones procesadas de la bandeja del sistema
          try {
            await Notifications.dismissAllNotificationsAsync();
            console.log('🧹 Notificaciones presentadas limpiadas');
          } catch (error) {
            console.warn('⚠️ No se pudieron limpiar las notificaciones presentadas:', error);
          }
        } else {
          console.log('📭 No hay notificaciones presentadas');
        }
        
      } catch (error) {
        console.error('❌ Error checking missed notifications:', error);
      }
    },

    // Cargar notificaciones (ahora solo datos mock)
    loadNotifications: () => {
      const currentState = get();
      
      // Evitar cargar múltiples veces
      if (currentState.isLoaded) {
        console.log('⚠️ Notificaciones ya están cargadas, saltando...');
        return;
      }
      
      console.log('🔄 Cargando notificaciones mock...');
      const unreadCount = mockNotifications.filter(n => !n.isRead).length;
      
      set({
        notifications: mockNotifications,
        unreadCount,
        isLoaded: true,
        lastRefreshTime: new Date(),
      });
      
      console.log('✅ Notificaciones mock cargadas:', mockNotifications.length);
      
      // Verificar notificaciones perdidas solo una vez
      setTimeout(() => {
        get().checkForMissedNotifications();
        // Iniciar auto-checking solo una vez
        get().startAutoChecking();
        // Iniciar notificaciones automáticas
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

      console.log('✅ Notificación agregada:', newNotification.title);
    },

    // Nueva función específica para notificaciones programadas
    addProgrammedNotification: (notification) => {
      // Verificar si ya existe usando el identificador único
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
          console.log('⚠️ Notificación programada ya existe, saltando:', notification.title);
          return;
        }
      }
      
      // Usar el timestamp programado si está disponible, sino la fecha actual
      const scheduledTimestamp = notification.data?.scheduledFor || 
                                notification.data?.originalTimestamp || 
                                Date.now();
      
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(scheduledTimestamp), // Usar timestamp correcto
        isRead: false,
      };

      // Las notificaciones programadas van a pending para requerir pull-to-refresh
      set((state) => ({
        pendingServerNotifications: [...state.pendingServerNotifications, newNotification],
        hasNewNotificationsAvailable: true,
      }));

      console.log('✅ Notificación programada agregada a pending:', newNotification.title, 'con timestamp:', newNotification.timestamp);
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

    // Verificar si hay notificaciones pendientes del servidor
    checkForNewNotifications: async () => {
      try {
        const currentState = get();
        
        // Solo mostrar el banner si hay notificaciones pendientes y no está ya mostrado
        if (currentState.pendingServerNotifications.length > 0 && !currentState.hasNewNotificationsAvailable) {
          set(state => ({
            hasNewNotificationsAvailable: true,
          }));
          console.log('📬 Nuevas notificaciones del servidor disponibles');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ Error checking for new notifications:', error);
        return false;
      }
    },

    // Refrescar notificaciones (solo por pull-to-refresh)
    refreshNotifications: async () => {
      try {
        console.log('🔄 Refrescando notificaciones...');
        
        const currentState = get();
        
        // Agregar las notificaciones pendientes del servidor
        if (currentState.pendingServerNotifications.length > 0) {
          const newNotifications = currentState.pendingServerNotifications;
          
          // Agregar las nuevas notificaciones al estado y limpiar las pendientes
          set(state => ({
            notifications: [...newNotifications, ...state.notifications],
            unreadCount: state.unreadCount + newNotifications.length,
            hasNewNotificationsAvailable: false,
            lastRefreshTime: new Date(),
            pendingServerNotifications: [], // Limpiar las pendientes
          }));
          
          console.log(`✅ Se agregaron ${newNotifications.length} notificaciones del servidor`);
        } else {
          // Solo actualizar el timestamp de refresh
          set(state => ({
            lastRefreshTime: new Date(),
            hasNewNotificationsAvailable: false,
          }));
          console.log('✅ Lista actualizada - no hay notificaciones nuevas');
        }
        
      } catch (error) {
        console.error('❌ Error refreshing notifications:', error);
      }
    },

    // Cerrar el banner de notificaciones nuevas
    dismissNewNotificationsBanner: () => {
      set(state => ({
        hasNewNotificationsAvailable: false,
      }));
      console.log('❌ Banner de notificaciones nuevas cerrado');
    },

    // Simular notificaciones del servidor (no aparecen hasta pull-to-refresh)
    simulateServerNotification: () => {
      const types: NotificationType[] = ['security', 'transaction', 'promotion', 'system', 'urgent'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const notificationTemplates = {
        security: {
          title: '🔒 Alerta del Servidor',
          description: 'Nueva alerta de seguridad detectada desde el servidor.',
          priority: 'high' as const,
        },
        transaction: {
          title: '💳 Transacción del Servidor',
          description: `Nueva transacción procesada: $${(Math.random() * 50000 + 5000).toFixed(0)} ARS.`,
          priority: 'medium' as const,
        },
        promotion: {
          title: '🎉 Promoción del Servidor',
          description: 'Nueva oferta especial disponible desde el servidor.',
          priority: 'medium' as const,
        },
        system: {
          title: '⚙️ Actualización del Servidor',
          description: 'Nueva actualización del sistema disponible.',
          priority: 'low' as const,
        },
        urgent: {
          title: '🚨 Urgente del Servidor',
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
      
      // Agregar a notificaciones pendientes del servidor (no visible hasta refresh)
      set(state => ({
        pendingServerNotifications: [...state.pendingServerNotifications, newServerNotification],
        hasNewNotificationsAvailable: true,
      }));
      
      console.log('📨 Notificación del servidor simulada (pendiente de refresh):', template.title);
    },

    startAutoNotifications: () => {
      const currentState = get();
      
      if (currentState.autoNotificationsInterval) {
        console.log('⏰ Auto-notifications ya está activo');
        return;
      }
      
      const interval = setInterval(() => {
        console.log('🔍 Auto-notifications: Simulando notificaciones automáticas...');
        get().simulateServerNotification();
      }, 15000); // Cada 15 segundos
      
      set({ autoNotificationsInterval: interval });
      console.log('⏰ Auto-notifications iniciado (cada 15 segundos)');
    },

    stopAutoNotifications: () => {
      const currentState = get();
      if (currentState.autoNotificationsInterval) {
        clearInterval(currentState.autoNotificationsInterval);
        set({ autoNotificationsInterval: null });
        console.log('⏹️ Auto-notifications detenido');
      }
    },
  };
}); 