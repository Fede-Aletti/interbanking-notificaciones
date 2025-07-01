import { Button, Card, Typography } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationType, notificationColors, notificationIcons } from '@/types/notifications';
import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SimulatorScreen = () => {
  const { simulateNotification, scheduleNotification } = useNotifications();
  const { 
    clearAllNotifications, 
    markAllAsRead, 
    notifications, 
    unreadCount,
    simulateServerNotification 
  } = useNotificationStore();
  const insets = useSafeAreaInsets();

  const notificationTypes: Array<{
    type: NotificationType;
    title: string;
    description: string;
  }> = [
    {
      type: 'security',
      title: 'Alerta de Seguridad',
      description: 'Simula una alerta de acceso no autorizado',
    },
    {
      type: 'transaction',
      title: 'Transacción',
      description: 'Simula una notificación de transacción',
    },
    {
      type: 'system',
      title: 'Sistema',
      description: 'Simula una notificación del sistema',
    },
    {
      type: 'promotion',
      title: 'Promoción',
      description: 'Simula una notificación promocional',
    },
    {
      type: 'urgent',
      title: 'Urgente',
      description: 'Simula una notificación urgente',
    },
  ];

  const handleSimulatePress = (type: NotificationType) => {
    simulateNotification(type);
    Alert.alert(
      'Notificación Push Enviada',
      `Se ha agregado una notificación push de tipo ${type} inmediatamente`,
      [{ text: 'OK' }]
    );
  };

  const handleServerNotificationPress = () => {
    simulateServerNotification();
    Alert.alert(
      'Notificación del Servidor',
      'Se ha creado una notificación del servidor. Usa pull-to-refresh en la pestaña de Notificaciones para verla.',
      [{ text: 'OK' }]
    );
  };

  const handleSchedulePress = (type: NotificationType) => {
    scheduleNotification(
      `${type.toUpperCase()}`,
      `Esta es una notificación programada de tipo ${type}`,
      type,
      'medium',
      5
    );
    Alert.alert(
      'Notificación Programada',
      'Se enviará una notificación en 5 segundos',
      [{ text: 'OK' }]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await clearAllNotifications();
          }
        },
      ]
    );
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    Alert.alert(
      'Marcadas como Leídas',
      'Todas las notificaciones han sido marcadas como leídas',
      [{ text: 'OK' }]
    );
  };

  const renderNotificationButton = (item: typeof notificationTypes[0]) => (
    <Card key={item.type} style={styles.buttonContainer}>
      <View style={styles.buttonHeader}>
        <View style={styles.iconContainer}>
          <View style={[
            styles.iconBackground,
            { backgroundColor: `${notificationColors[item.type]}20` }
          ]}>
            <Typography style={{ color: notificationColors[item.type], fontSize: 18 }}>
              {notificationIcons[item.type]}
            </Typography>
          </View>
        </View>
        <View style={styles.buttonInfo}>
          <Typography variant="subtitle" color="#1E293B">
            {item.title}
          </Typography>
          <Typography variant="body" color="#6B7280">
            {item.description}
          </Typography>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <Button
          variant="primary"
          size="small"
          style={styles.actionButton}
          onPress={() => handleSimulatePress(item.type)}
        >
          Push Inmediato
        </Button>
        
        <Button
          variant="secondary"
          size="small"
          style={styles.actionButton}
          onPress={() => handleSchedulePress(item.type)}
        >
          Programar (5s)
        </Button>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Platform.select({
              ios: Math.max(insets.bottom + 80, 100), // Safe area + tab height + extra
              android: Math.max(insets.bottom + 72, 90), // Safe area + tab height + extra
            }),
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="h1" color="#1E293B">
            Simulador de Notificaciones
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.headerSubtitle}>
            Genera notificaciones de prueba para ver cómo funcionan
          </Typography>
        </View>

        <Card style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Typography variant="h2" color="#8B5CF6" style={styles.statNumber}>
                {notifications.length}
              </Typography>
              <Typography variant="caption" color="#6B7280">
                Total
              </Typography>
            </View>
            <View style={styles.statItem}>
              <Typography variant="h2" color="#EF4444" style={styles.statNumber}>
                {unreadCount}
              </Typography>
              <Typography variant="caption" color="#6B7280">
                No Leídas
              </Typography>
            </View>
            <View style={styles.statItem}>
              <Typography variant="h2" color="#10B981" style={styles.statNumber}>
                {notifications.length - unreadCount}
              </Typography>
              <Typography variant="caption" color="#6B7280">
                Leídas
              </Typography>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Typography variant="h3" color="#1E293B" style={styles.sectionTitle}>
            Tipos de Notificación
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.sectionSubtitle}>
            Estas aparecen inmediatamente (simula notificaciones push)
          </Typography>
          {notificationTypes.map(renderNotificationButton)}
        </View>

        <View style={styles.section}>
          <Typography variant="h3" color="#1E293B" style={styles.sectionTitle}>
            Notificaciones del Servidor
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.sectionSubtitle}>
            Requieren pull-to-refresh para verlas (simula notificaciones del backend)
          </Typography>
          
          <Card style={styles.serverNotificationCard}>
            <View style={styles.serverNotificationContent}>
              <View style={styles.serverIconContainer}>
                <Typography style={styles.serverIcon}>🌐</Typography>
              </View>
              <View style={styles.serverTextContainer}>
                <Typography variant="subtitle" color="#1E293B">
                  Simular desde Servidor
                </Typography>
                <Typography variant="body" color="#6B7280">
                  Crea notificaciones que requieren pull-to-refresh
                </Typography>
              </View>
            </View>
            
            <Button
              variant="secondary"
              fullWidth
              style={styles.serverButton}
              onPress={handleServerNotificationPress}
            >
              📨 Crear Notificación del Servidor
            </Button>
          </Card>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" color="#1E293B" style={styles.sectionTitle}>
            Acciones Globales
          </Typography>
          
          <Button
            variant="success"
            fullWidth
            style={styles.globalButton}
            onPress={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            ✓ Marcar Todas como Leídas ({unreadCount})
          </Button>

          <Button
            variant="danger"
            fullWidth
            style={styles.globalButton}
            onPress={handleClearAll}
            disabled={notifications.length === 0}
          >
            🗑️ Limpiar Todas las Notificaciones
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
    paddingBottom: 24,
  },
  headerSubtitle: {
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    marginBottom: 16,
    marginTop: -8,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  buttonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInfo: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  globalButton: {
    marginBottom: 12,
  },
  // Notificaciones del servidor
  serverNotificationCard: {
    marginBottom: 16,
  },
  serverNotificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serverIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serverIcon: {
    fontSize: 22,
    includeFontPadding: false,
  },
  serverTextContainer: {
    flex: 1,
  },
  serverButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
});

export default SimulatorScreen; 