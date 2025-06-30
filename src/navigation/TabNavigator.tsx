import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { NotificationTabIcon } from '@/components/NotificationTabIcon';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { NotificationsScreen, SimulatorScreen } from '@/screens';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: Platform.select({
            ios: 8,
            android: 12,
          }),
          paddingBottom: Platform.select({
            ios: Math.max(insets.bottom, 20),
            android: Math.max(insets.bottom + 8, 16),
          }),
          height: Platform.select({
            ios: Math.max(insets.bottom + 60, 80),
            android: Math.max(insets.bottom + 56, 72),
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notificaciones',
          tabBarIcon: ({ color, focused }) => (
            <NotificationTabIcon 
              color={color} 
              size={focused ? 28 : 26}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Simulator"
        component={SimulatorScreen}
        options={{
          title: 'Simulador',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 26} 
              name="bolt.fill" 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 