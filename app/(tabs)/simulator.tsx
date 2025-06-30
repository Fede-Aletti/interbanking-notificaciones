import { Button, Card, Typography } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationType, notificationColors, notificationIcons } from '@/types/notifications';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

const SimulatorScreen = () => {
  const { simulateNotification, scheduleNotification } = useNotifications();
  const { clearAllNotifications, markAllAsRead, notifications, unreadCount } = useNotificationStore();

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
      'Notificación Enviada',
      `Se ha agregado una notificación de tipo ${type} al inbox`,
      [{ text: 'OK' }]
    );
  };

  const handleSchedulePress = (type: NotificationType) => {
    scheduleNotification(
      `📱 Notificación Programada - ${type.toUpperCase()}`,
      `Esta es una notificación programada de tipo ${type}`,
      type,
      'medium',
      3
    );
    Alert.alert(
      'Notificación Programada',
      'Se enviará una notificación en 3 segundos',
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
          onPress: clearAllNotifications 
        },
      ]
    );
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
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
          Simular Inmediato
        </Button>
        
        <Button
          variant="secondary"
          size="small"
          style={styles.actionButton}
          onPress={() => handleSchedulePress(item.type)}
        >
          Programar (3s)
        </Button>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
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
          {notificationTypes.map(renderNotificationButton)}
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
    paddingBottom: 20,
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
});

export default SimulatorScreen; 