import {
    Urbanist_100Thin,
    Urbanist_200ExtraLight,
    Urbanist_300Light,
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
} from '@expo-google-fonts/urbanist';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import { AppNavigator } from '@/navigation/AppNavigator';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function App() {
  const colorScheme = useColorScheme();
  const { loadNotifications } = useNotificationStore();
  
  // Inicializa el hook de notificaciones en el nivel raíz
  useNotifications();
  
  const [loaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
    Urbanist_100Thin,
    Urbanist_200ExtraLight,
    Urbanist_300Light,
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
  });

  // Inicializar notificaciones cuando las fuentes estén listas
  useEffect(() => {
    if (loaded) {
      console.log('🚀 Inicializando app...');
      loadNotifications();
    }
  }, [loaded, loadNotifications]);

  // Esperar a que se carguen las fuentes
  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppNavigator />
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 