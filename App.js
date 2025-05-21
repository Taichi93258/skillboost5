import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import QuizScreen from './src/screens/QuizScreen';
import ProgressScreen from './src/screens/ProgressScreen';

import { registerForPushNotificationsAsync, scheduleDailyNotification } from './src/notifications';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync();
      await scheduleDailyNotification();
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Categories" component={CategoryScreen} options={{ title: 'Categories' }} />
          <Stack.Screen name="Quiz" component={QuizScreen} options={({ route }) => ({ title: route.params.category })} />
          <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
