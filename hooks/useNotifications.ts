import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationType } from '@/types/notifications';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

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
  const { addNotification } = useNotificationStore();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const { title, body, data } = notification.request.content;
      
      addNotification({
        title: title || 'Nueva Notificación',
        description: body || 'Has recibido una nueva notificación',
        type: (data?.type as NotificationType) || 'system',
        priority: (data?.priority as 'low' | 'medium' | 'high') || 'medium',
        data: data || {},
      });
    });

    // Listener para respuestas a notificaciones
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data;
      // Aquí podríamos navegar a una pantalla específica basada en los datos
      console.log('Notification response:', notificationData);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [addNotification]);

  const scheduleNotification = async (
    title: string,
    body: string,
    type: NotificationType = 'system',
    priority: 'low' | 'medium' | 'high' = 'medium',
    delaySeconds: number = 1
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type, priority },
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      },
    });
  };

  const simulateNotification = (type: NotificationType = 'system') => {
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
    addNotification({
      title: notification.title,
      description: notification.body,
      type,
      priority: notification.priority,
      data: { simulated: true },
    });
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
        projectId: '671a0e65-fb17-4c5e-9aad-6e5d26b87e4c', // Esto debería ser tu project ID real
      });
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  } else {
    console.log('Debe usar un dispositivo físico para las notificaciones push');
  }

  return token?.data;
} 