import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/context/AuthContext';
import { CampusDataProvider } from '@/context/CampusDataContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Pastikan splash tersembunyi
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <CampusDataProvider>
            <AnimatedSplashOverlay />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#F8FAFC' },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="explore" />
              <Stack.Screen name="claims" />
              <Stack.Screen name="profile" />
              <Stack.Screen
                name="item/[id]"
                options={{
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="claim/[id]"
                options={{
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="admin/login"
                options={{
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen name="admin/dashboard" />
              <Stack.Screen name="admin/items" />
              <Stack.Screen name="admin/create" />
              <Stack.Screen name="admin/claims" />
              <Stack.Screen name="admin/profile" />
            </Stack>
          </CampusDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
