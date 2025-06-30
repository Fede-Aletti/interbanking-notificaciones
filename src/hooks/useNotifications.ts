import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationType } from '@/types/notifications';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const { 
    addNotification, 
    addProgrammedNotification, 
    checkForMissedNotifications,
    stopAutoChecking,
    stopAutoNotifications,
    isLoaded
  } = useNotificationStore();
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);
  const appState = useRef(AppState.currentState);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Evitar inicializaciones múltiples
    if (isInitialized.current) {
      return;
    }
    
    isInitialized.current = true;
    registerForPushNotificationsAsync();

    // Listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      const { title, body, data } = notification.request.content;
      
      try {
        // Las programadas van a pending, las normales al listado principal
        if (data?.isProgrammed) {
          addProgrammedNotification({
            title: title || 'Nueva Notificación',
            description: body || 'Has recibido una nueva notificación',
            type: (data?.type as NotificationType) || 'system',
            priority: (data?.priority as 'low' | 'medium' | 'high') || 'medium',
            data: { ...data, originalTimestamp: Date.now() },
          });
        } else {
          await addNotification({
            title: title || 'Nueva Notificación',
            description: body || 'Has recibido una nueva notificación',
            type: (data?.type as NotificationType) || 'system',
            priority: (data?.priority as 'low' | 'medium' | 'high') || 'medium',
            data: data || {},
          });
        }
      } catch (error) {
        // Silenciar errores de procesamiento
      }
    });

    // Listener para respuestas a notificaciones
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data;
      // Aquí se podría manejar navegación específica
    });

    // Detectar cuando la app vuelve del background
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isLoaded) {
          checkForMissedNotifications();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      subscription?.remove();
      
      stopAutoChecking();
      stopAutoNotifications();
      isInitialized.current = false;
    };
  }, []);

  const scheduleNotification = async (
    title: string,
    body: string,
    type: NotificationType = 'system',
    priority: 'low' | 'medium' | 'high' = 'medium',
    delaySeconds: number = 1
  ) => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ Permisos de notificación no concedidos');
        return null;
      }

      // Verificar si estamos en simulador
      if (!Device.isDevice) {
        console.warn('⚠️ Las notificaciones no funcionan en el simulador. Usa un dispositivo físico.');
        // Simular la notificación como inmediata para testing
        setTimeout(async () => {
          await addNotification({
            title: `📱 [SIMULADO] ${title}`,
            description: `${body} (Esta notificación fue simulada porque estás en el simulador)`,
            type,
            priority,
            data: { simulated: true, wasScheduled: true, originalDelay: delaySeconds },
          });
        }, delaySeconds * 1000);
        return `simulated-${Date.now()}`;
      }

      // ID único para evitar duplicados
      const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { 
            type, 
            priority, 
            timestamp: Date.now(),
            isProgrammed: true,
            scheduledFor: Date.now() + (delaySeconds * 1000),
            identifier: uniqueId
          },
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        },
      });
      
      console.log(`✅ Notificación programada: ${identifier} en ${delaySeconds}s`);
      return identifier;
    } catch (error) {
      console.error('❌ Error al programar notificación:', error);
      return null;
    }
  };

  const simulateNotification = async (type: NotificationType = 'system') => {
    const mockNotifications = {
      security: {
        title: '🔒 Alerta de Seguridad',
        body: 'Acceso detectado desde un nuevo dispositivo. Verifica tu cuenta.',
        priority: 'high' as const,
      },
      transaction: {
        title: '💳 Transacción Realizada',
        body: 'Se ha procesado una transferencia por $15,000 ARS.',
        priority: 'medium' as const,
      },
      system: {
        title: '⚙️ Mantenimiento Programado',
        body: 'El sistema estará en mantenimiento el domingo de 2:00 a 4:00 AM.',
        priority: 'low' as const,
      },
      promotion: {
        title: '🎉 Nueva Promoción',
        body: '¡Obtén hasta 3% de descuento en todas tus transferencias!',
        priority: 'medium' as const,
      },
      urgent: {
        title: '🚨 Acción Requerida',
        body: 'Tu sesión expirará en 5 minutos. Confirma tu identidad.',
        priority: 'high' as const,
      },
    };

    const notification = mockNotifications[type];
    try {
      await addNotification({
        title: notification.title,
        description: notification.body,
        type,
        priority: notification.priority,
        data: { simulated: true, timestamp: Date.now() },
      });
    } catch (error) {
      // Silenciar errores de simulación
    }
  };

  return {
    scheduleNotification,
    simulateNotification,
  };
};

async function registerForPushNotificationsAsync() {
  let token;

  console.log('🔔 Inicializando notificaciones...');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6',
    });
    console.log('✅ Canal de Android configurado');
  }

  if (Device.isDevice) {
    console.log('📱 Dispositivo físico detectado');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log(`📋 Estado actual de permisos: ${existingStatus}`);
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('❓ Solicitando permisos de notificación...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log(`📋 Permisos después de solicitar: ${finalStatus}`);
    }
    
    if (finalStatus !== 'granted') {
      console.error('❌ Permisos de notificación DENEGADOS');
      alert('¡No se pudieron obtener permisos para las notificaciones push!');
      return;
    }
    
    console.log('✅ Permisos de notificación CONCEDIDOS');
    
    try {
      token = await Notifications.getExpoPushTokenAsync({
        projectId: '53bf3907-5c46-4a59-9593-e9a2fd059d11',
      });
      console.log('✅ Token de Expo obtenido exitosamente');
    } catch (error) {
      console.error('❌ Error al obtener token de Expo:', error);
    }
  } else {
    console.warn('⚠️ Simulador detectado - Las notificaciones push no funcionarán');
  }

  return token?.data;
} 