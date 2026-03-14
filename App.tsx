import './global.css';

import React from 'react';
import { Pressable, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { BarChart3, Bell, BellRing, Settings } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeToggleButton } from './src/components/ThemeToggleButton';
import { TaskProvider } from './src/contexts/TaskContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { ToastProvider, useToast } from './src/contexts/ToastContext';
import { RootStackParamList } from './src/navigation/types';
import { AddTaskScreen } from './src/screens/AddTaskScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { configureNotifications, hasNotificationPermission, requestNotificationPermission } from './src/services/notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [notificationEnabled, setNotificationEnabled] = React.useState(false);

  React.useEffect(() => {
    void configureNotifications();
  }, []);

  React.useEffect(() => {
    const checkPermission = async () => {
      const granted = await hasNotificationPermission();
      setNotificationEnabled(granted);
    };

    void checkPermission();
  }, []);

  const handleNotificationPress = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    showToast(granted ? 'Task reminders enabled' : 'Notification permission blocked');
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <Stack.Navigator
          screenOptions={{
            contentStyle: { backgroundColor: isDark ? '#09090b' : '#fafafa' },
            headerStyle: { backgroundColor: isDark ? '#09090b' : '#fafafa' },
            headerTitleStyle: { color: isDark ? '#f4f4f5' : '#18181b' },
            headerTintColor: isDark ? '#f4f4f5' : '#18181b',
            animation: 'fade_from_bottom',
            animationDuration: 120,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'Dashboard',
              headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable onPress={handleNotificationPress} style={{ marginRight: 10 }}>
                    {notificationEnabled ? (
                      <BellRing size={18} color={isDark ? '#22c55e' : '#16a34a'} />
                    ) : (
                      <Bell size={18} color={isDark ? '#e4e4e7' : '#27272a'} />
                    )}
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('Analytics')} style={{ marginRight: 10 }}>
                    <BarChart3 size={18} color={isDark ? '#e4e4e7' : '#27272a'} />
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('Settings')} style={{ marginRight: 10 }}>
                    <Settings size={18} color={isDark ? '#e4e4e7' : '#27272a'} />
                  </Pressable>
                  <ThemeToggleButton />
                </View>
              ),
            })}
          />
          <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={({ route }) => ({ title: route.params?.taskId ? 'Edit Task' : 'Add Task' })}
          />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TaskProvider>
            <ToastProvider>
              <AppNavigator />
            </ToastProvider>
          </TaskProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
