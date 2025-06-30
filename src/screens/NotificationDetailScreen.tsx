import { Button, Card, Typography } from '@/components/ui';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Notification, notificationColors, notificationIcons } from '@/types/notifications';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'NotificationDetail'>;

const NotificationDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { id } = route.params;
  const { notifications, markAsRead, deleteNotification } = useNotificationStore();
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const handleNotificationLoad = async () => {
      if (id) {
        const foundNotification = notifications.find(n => n.id === id);
        if (foundNotification) {
          setNotification(foundNotification);
          if (!foundNotification.isRead) {
            await markAsRead(id);
          }
        }
      }
    };
    
    handleNotificationLoad();
  }, [id, notifications, markAsRead]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (notification) {
              await deleteNotification(notification.id);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Media';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#6B7280';
      default:
        return '#F59E0B';
    }
  };

  if (!notification) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Typography style={styles.errorIcon}>❌</Typography>
          <Typography variant="h2" color="#1E293B" style={styles.errorTitle}>
            Notificación no encontrada
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.errorDescription}>
            La notificación que buscas no existe o ha sido eliminada.
          </Typography>
          <Button variant="primary" onPress={handleGoBack} style={styles.backButton}>
            Volver
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={handleGoBack}>
          <Typography style={styles.backIcon}>←</Typography>
        </TouchableOpacity>
        <Typography variant="subtitle" color="#1E293B">
          Detalle
        </Typography>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Typography style={styles.deleteIcon}>🗑️</Typography>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon and Type */}
        <View style={styles.iconSection}>
          <View style={[
            styles.largeIconBackground,
            { backgroundColor: `${notificationColors[notification.type]}20` }
          ]}>
            <Typography style={[
              styles.largeIconText,
              { color: notificationColors[notification.type] }
            ]}>
              {notificationIcons[notification.type]}
            </Typography>
          </View>
          <Typography
            variant="overline"
            color={notificationColors[notification.type]}
            style={styles.typeLabel}
          >
            {notification.type.toUpperCase()}
          </Typography>
        </View>

        {/* Title */}
        <Typography variant="h2" color="#1E293B" style={styles.title}>
          {notification.title}
        </Typography>

        {/* Description */}
        <Typography variant="body" color="#6B7280" style={styles.description}>
          {notification.description}
        </Typography>

        {/* Metadata */}
        <Card style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Typography variant="overline" color="#9CA3AF" style={styles.metadataLabel}>
              Fecha y Hora
            </Typography>
            <Typography variant="body" color="#374151">
              {formatDate(notification.timestamp)}
            </Typography>
          </View>

          <View style={styles.metadataItem}>
            <Typography variant="overline" color="#9CA3AF" style={styles.metadataLabel}>
              Prioridad
            </Typography>
            <View style={styles.priorityContainer}>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(notification.priority) }
              ]} />
              <Typography
                variant="body"
                color={getPriorityColor(notification.priority)}
              >
                {getPriorityLabel(notification.priority)}
              </Typography>
            </View>
          </View>

          <View style={styles.metadataItem}>
            <Typography variant="overline" color="#9CA3AF" style={styles.metadataLabel}>
              Estado
            </Typography>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: notification.isRead ? '#10B981' : '#EF4444' }
              ]} />
              <Typography variant="body" color="#374151">
                {notification.isRead ? 'Leída' : 'No leída'}
              </Typography>
            </View>
          </View>

          <View style={styles.metadataItem}>
            <Typography variant="overline" color="#9CA3AF" style={styles.metadataLabel}>
              ID de Notificación
            </Typography>
            <Typography style={styles.idText} color="#6B7280">
              {notification.id}
            </Typography>
          </View>
        </Card>

        {/* Additional Data */}
        {notification.data && Object.keys(notification.data).length > 0 && (
          <Card style={styles.dataContainer}>
            <Typography variant="subtitle" color="#1E293B" style={styles.dataTitle}>
              Datos Adicionales
            </Typography>
            <View style={styles.dataContent}>
              <Typography style={styles.dataText} color="#374151">
                {JSON.stringify(notification.data, null, 2)}
              </Typography>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button variant="danger" fullWidth onPress={handleDelete}>
            Eliminar Notificación
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButtonHeader: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#374151',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  largeIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  largeIconText: {
    fontSize: 40,
  },
  typeLabel: {
    letterSpacing: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
  },
  metadataContainer: {
    marginBottom: 24,
  },
  metadataItem: {
    marginBottom: 16,
  },
  metadataLabel: {
    marginBottom: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  idText: {
    fontFamily: 'Courier',
    fontSize: 14,
  },
  dataContainer: {
    marginBottom: 24,
  },
  dataTitle: {
    marginBottom: 12,
  },
  dataContent: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  dataText: {
    fontFamily: 'Courier',
    fontSize: 12,
    lineHeight: 16,
  },
  actionsContainer: {
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    paddingHorizontal: 24,
  },
});

export default NotificationDetailScreen; 