import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { NotificationDetailScreen } from '@/screens';
import { TabNavigator } from './TabNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="NotificationDetail" 
        component={NotificationDetailScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
    </Stack.Navigator>
  );
}; 