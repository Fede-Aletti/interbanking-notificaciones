import { Badge, IconSymbol } from '@/components/ui';
import { useNotificationStore } from '@/store/useNotificationStore';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface NotificationTabIconProps {
  color: string;
  size?: number;
}

export const NotificationTabIcon: React.FC<NotificationTabIconProps> = ({ 
  color, 
  size = 28 
}) => {
  const { unreadCount } = useNotificationStore();

  return (
    <View style={styles.container}>
      <IconSymbol size={size} name="bell.fill" color={color} />
      {unreadCount > 0 && (
        <View style={styles.badgeContainer}>
          <Badge variant="danger" size="small">
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Badge>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
}); 