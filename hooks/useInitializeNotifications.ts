import { useNotificationStore } from '@/store/useNotificationStore';
import { useEffect } from 'react';

// Hook para inicializar el store con datos persistidos
export const useInitializeNotifications = () => {
  const { loadNotifications, isLoaded } = useNotificationStore();
  
  useEffect(() => {
    if (!isLoaded) {
      loadNotifications();
    }
  }, [loadNotifications, isLoaded]);
  
  return isLoaded;
}; 