import { Badge, Card, Typography } from '@/components/ui';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Notification, notificationColors, notificationIcons } from '@/types/notifications';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const NotificationsScreen = () => {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
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
                <Typography style={{ color: notificationColors[item.type], fontSize: 20 }}>
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
                <Typography variant="caption" color="#9CA3AF">
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
      <Typography variant="h1" color="#1E293B">
        Notificaciones
      </Typography>
      {unreadCount > 0 && (
        <Badge variant="danger">
          {unreadCount}
        </Badge>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Typography style={styles.emptyIcon}>🔔</Typography>
      <Typography variant="h3" color="#374151" style={styles.emptyTitle}>
        No hay notificaciones
      </Typography>
      <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
        Cuando recibas notificaciones aparecerán aquí
      </Typography>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
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
          notifications.length === 0 && styles.listContainerEmpty
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
    paddingVertical: 20,
    paddingBottom: 16,
  },
  itemContainer: {
    marginBottom: 12,
  },
  notificationCard: {
    padding: 0,
  },
  contentRow: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    marginBottom: 8,
  },
  typeContainer: {
    alignSelf: 'flex-start',
  },
  typeText: {
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
  },
});

export default NotificationsScreen; 