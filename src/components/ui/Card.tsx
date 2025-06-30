import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  variant?: 'default' | 'elevated' | 'unread';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  variant = 'default',
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`padding_${padding}`],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  default: {},
  elevated: {
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    backgroundColor: '#FEFEFF',
  },
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: 12,
  },
  padding_medium: {
    padding: 16,
  },
  padding_large: {
    padding: 20,
  },
}); 