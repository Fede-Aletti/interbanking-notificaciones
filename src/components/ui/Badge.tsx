import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { Typography } from './Typography';

export interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) => {
  const getTextColor = () => {
    return '#FFFFFF';
  };

  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        style,
      ]}
      {...props}
    >
      <Typography variant="caption" color={getTextColor()} style={styles.text}>
        {children}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#8B5CF6',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  success: {
    backgroundColor: '#10B981',
  },
  warning: {
    backgroundColor: '#F59E0B',
  },
  info: {
    backgroundColor: '#3B82F6',
  },
  size_small: {
    paddingHorizontal: 6,
    paddingVertical: Platform.OS === 'android' ? 1 : 2,
    minWidth: 16,
    borderRadius: 8,
  },
  size_medium: {
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'android' ? 2 : 4,
    minWidth: 20,
    borderRadius: 10,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false, // Android specific
    textAlignVertical: 'center', // Android specific
    ...(Platform.OS === 'android' && {
      lineHeight: undefined, // Let Android handle line height naturally
    }),
  },
}); 