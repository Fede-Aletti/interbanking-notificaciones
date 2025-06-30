import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { NotificationTabIcon } from "@/components/NotificationTabIcon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
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
            ios: 20,
            android: 16,
          }),
          height: Platform.select({
            ios: 80,
            android: 72,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* Index route - Redirige al simulador */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Oculta del tab bar
        }}
      />
      
      <Tabs.Screen
        name="simulator"
        options={{
          title: "Simulador",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 26} 
              name="bolt.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notificaciones",
          tabBarIcon: ({ color, focused }) => (
            <NotificationTabIcon 
              color={color} 
              size={focused ? 28 : 26}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
