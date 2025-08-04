// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

// Import screen otentikasi
import SignInScreen from './src/screens/authen/SignInScreen';
import SignUpScreen from './src/screens/authen/SignUpScreen';

// Import navigator yang sudah dipisah
import UserNavigator from './src/components/navigation/UserNavigator';
import AdminNavigator from './src/components/navigation/AdminNavigator';

// Atur handler notifikasi global di sini
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserHome"
          component={UserNavigator} // Panggil navigator user
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminNavigator} // Panggil navigator admin
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
