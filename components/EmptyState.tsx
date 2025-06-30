import { Typography } from '@/components/ui';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  hint?: string;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📬',
  title,
  description,
  hint,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Typography style={styles.icon}>{icon}</Typography>
      </View>
      
      <Typography variant="h2" color="#1E293B" style={styles.title}>
        {title}
      </Typography>
      
      <Typography variant="body" color="#6B7280" style={styles.description}>
        {description}
      </Typography>
      
      {hint && (
        <View style={styles.hintContainer}>
          <Typography variant="caption" color="#9CA3AF" style={styles.hint}>
            {hint}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.select({
      ios: 80,
      android: 60,
    }),
    paddingHorizontal: 32,
    minHeight: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  icon: {
    fontSize: 48,
    includeFontPadding: false,
    textAlign: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    lineHeight: Platform.select({
      ios: 22,
      android: 20,
    }),
    marginBottom: 24,
    maxWidth: 280,
  },
  hintContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hint: {
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlign: 'center',
    fontSize: 13,
  },
}); 