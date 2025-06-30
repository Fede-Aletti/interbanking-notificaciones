import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  return <View style={styles.background} />;
}

export function useBottomTabOverflow() {
  return Platform.select({
    ios: 0,
    android: 0,
    default: 0,
  });
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      },
      android: {
        backgroundColor: '#FFFFFF',
        elevation: 8,
      },
    }),
  },
});
