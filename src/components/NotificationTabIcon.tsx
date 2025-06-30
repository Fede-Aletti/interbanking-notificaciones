import { Badge, IconSymbol } from '@/components/ui';
import { useNotificationStore } from '@/store/useNotificationStore';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface NotificationTabIconProps {
  color: string;
  size?: number;
  focused?: boolean;
}

export const NotificationTabIcon: React.FC<NotificationTabIconProps> = ({ 
  color, 
  size = 28,
  focused = false,
}) => {
  const { unreadCount } = useNotificationStore();

  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <IconSymbol size={size} name="bell.fill" color={color} />
      {unreadCount > 0 && (
        <View style={[
          styles.badgeContainer,
          Platform.select({
            ios: {
              top: -8,
              right: -8,
            },
            android: {
              top: -6,
              right: -6,
            },
          })
        ]}>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  focusedContainer: {
    transform: [{ scale: 1.1 }],
  },
  badgeContainer: {
    position: 'absolute',
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
}); 