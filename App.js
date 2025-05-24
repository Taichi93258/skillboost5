import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import LevelScreen from './src/screens/LevelScreen';
import QuizScreen from './src/screens/QuizScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';
import SplashScreen from './src/screens/SplashScreen';

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
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerStyle: { backgroundColor: '#6200ee' },
              headerTintColor: '#fff',
              contentStyle: { backgroundColor: '#f5f5f5' },
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Categories"
              component={CategoryScreen}
              options={{ title: 'カテゴリ', headerBackVisible: false }}
            />
            <Stack.Screen name="UserInfo" component={UserInfoScreen} options={{ title: 'ユーザー情報' }} />
            <Stack.Screen
              name="Levels"
              component={LevelScreen}
              options={({ route }) => ({ title: `${route.params.category} のレベル` })}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={({ route }) => ({ title: `${route.params.category} - レベル ${route.params.level}` })}
            />
            <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: '進捗状況' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
