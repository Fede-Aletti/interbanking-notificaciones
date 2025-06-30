import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationType } from '@/types/notifications';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
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
  const { addNotification, checkForMissedNotifications } = useNotificationStore();
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log('📱 Notificación recibida:', notification.request.content.title);
      
      const { title, body, data } = notification.request.content;
      
      try {
        await addNotification({
          title: title || 'Nueva Notificación',
          description: body || 'Has recibido una nueva notificación',
          type: (data?.type as NotificationType) || 'system',
          priority: (data?.priority as 'low' | 'medium' | 'high') || 'medium',
          data: data || {},
        });
        console.log('✅ Notificación agregada al store');
      } catch (error) {
        console.error('❌ Error agregando notificación:', error);
      }
    });

    // Listener para respuestas a notificaciones
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data;
      console.log('👆 Notification response:', notificationData);
    });

    // Listener para cambios de estado de la app
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('🔄 App volvió al foreground, verificando notificaciones perdidas...');
        checkForMissedNotifications();
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
    };
  }, [addNotification, checkForMissedNotifications]);

  const scheduleNotification = async (
    title: string,
    body: string,
    type: NotificationType = 'system',
    priority: 'low' | 'medium' | 'high' = 'medium',
    delaySeconds: number = 1
  ) => {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type, priority, timestamp: Date.now() },
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        },
      });
      console.log('⏰ Notificación programada:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
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
      console.log('✅ Notificación simulada agregada');
    } catch (error) {
      console.error('❌ Error simulating notification:', error);
    }
  };

  return {
    scheduleNotification,
    simulateNotification,
  };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('¡No se pudieron obtener permisos para las notificaciones push!');
      return;
    }
    
    try {
      token = await Notifications.getExpoPushTokenAsync({
        projectId: '53bf3907-5c46-4a59-9593-e9a2fd059d11', // Usar el projectId correcto del app.json
      });
      console.log('📱 Expo Push Token:', token?.data);
    } catch (error) {
      console.log('❌ Error getting push token:', error);
    }
  } else {
    console.log('⚠️ Debe usar un dispositivo físico para las notificaciones push');
  }

  return token?.data;
} 