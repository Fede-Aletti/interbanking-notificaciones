import { EmptyState } from '@/components/EmptyState';
import { Badge, Card, Typography } from '@/components/ui';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Notification, notificationColors, notificationIcons } from '@/types/notifications';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationsScreen = () => {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    router.push(`/notification-detail?id=${notification.id}` as any);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        style={styles.itemContainer}
      >
        <Card
          variant={!item.isRead ? 'unread' : 'default'}
          style={styles.notificationCard}
        >
          <View style={styles.contentRow}>
            <View style={styles.iconContainer}>
              <View style={[
                styles.iconBackground,
                { backgroundColor: `${notificationColors[item.type]}20` }
              ]}>
                <Typography style={[
                  styles.iconText,
                  { color: notificationColors[item.type] }
                ]}>
                  {notificationIcons[item.type]}
                </Typography>
              </View>
              {item.priority === 'high' && (
                <View style={styles.priorityBadge} />
              )}
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Typography
                  variant={!item.isRead ? 'subtitle' : 'body'}
                  color={!item.isRead ? '#1E293B' : '#374151'}
                  numberOfLines={1}
                  style={styles.title}
                >
                  {item.title}
                </Typography>
                <Typography variant="caption" color="#9CA3AF" style={styles.timeText}>
                  {formatTime(item.timestamp)}
                </Typography>
              </View>
              
              <Typography variant="body" color="#6B7280" numberOfLines={2} style={styles.description}>
                {item.description}
              </Typography>
              
              <View style={styles.typeContainer}>
                <Typography
                  variant="overline"
                  color={notificationColors[item.type]}
                  style={styles.typeText}
                >
                  {item.type.toUpperCase()}
                </Typography>
              </View>
            </View>

            {!item.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <Typography variant="h1" color="#1E293B" style={styles.headerTitle}>
        Notificaciones
      </Typography>
      {unreadCount > 0 && (
        <View style={styles.headerBadgeContainer}>
          <Badge variant="danger">
            {unreadCount}
          </Badge>
        </View>
      )}
    </View>
  );

  const ListEmptyComponent = () => (
    <EmptyState
      icon="📱"
      title="No hay notificaciones"
      description="Cuando recibas notificaciones aparecerán aquí.
Usa el simulador para crear algunas de prueba."
      hint="💡 Ve a la pestaña 'Simulador' para generar notificaciones"
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          notifications.length === 0 && styles.listContainerEmpty,
          {
            paddingBottom: Platform.select({
              ios: Math.max(insets.bottom + 80, 100), // Safe area + tab height + extra
              android: Math.max(insets.bottom + 72, 90), // Safe area + tab height + extra
            }),
          }
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.select({
      ios: 20,
      android: 16,
    }),
    paddingBottom: 16,
  },
  headerTitle: {
    flex: 1,
  },
  headerBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    marginBottom: 12,
  },
  notificationCard: {
    padding: 0,
  },
  contentRow: {
    flexDirection: 'row',
    padding: Platform.select({
      ios: 16,
      android: 14,
    }),
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  priorityBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Platform.select({
      ios: 4,
      android: 2,
    }),
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    includeFontPadding: false,
    textAlign: 'right',
  },
  description: {
    marginBottom: Platform.select({
      ios: 8,
      android: 6,
    }),
  },
  typeContainer: {
    alignSelf: 'flex-start',
  },
  typeText: {
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    top: Platform.select({
      ios: 16,
      android: 14,
    }),
    right: Platform.select({
      ios: 16,
      android: 14,
    }),
  },
});

export default NotificationsScreen; 