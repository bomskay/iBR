import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Ionicons, Octicons, FontAwesome } from '@expo/vector-icons'; // Import ikon dari @expo/vector-icons
import SignInScreen from './components/SignInScreen';
import SignUpScreen from './components/SignUpScreen';
import UserHome from './components/UserHome';
import AdminHome from './components/AdminHome';
import AccountInformationScreen from './components/AccountInformationScreen';
import StockScreen from './components/StockScreen';
import OrderScreen from './components/OrderScreen'; // Import OrderScreen
import CashierScreen from './components/CashierScreen';
import SalesReportScreen from './components/SalesReportScreen'; // Import SalesReportScreen
import colors from './assets/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.secondary, // Warna untuk label dan ikon aktif
        tabBarInactiveTintColor: colors.inactive, // Warna untuk label dan ikon tidak aktif
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserHome}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => ( // Tambahkan ikon untuk Home
            <Octicons name="home" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="AccountInformation"
        component={AccountInformationScreen}
        options={{
          tabBarLabel: 'Akun',
          tabBarIcon: ({ color, size }) => ( // Tambahkan ikon untuk Account
            <Octicons name="person" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
};

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.secondary, // Warna untuk label dan ikon aktif
        tabBarInactiveTintColor: colors.inactive, // Warna untuk label dan ikon tidak aktif
      }}
    >
      <Tab.Screen
        name="Admin"
        component={AdminHome}
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, size }) => ( // Tambahkan ikon untuk Admin
            <Ionicons name="settings" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Stock"
        component={StockScreen}
        options={{
          tabBarLabel: 'Stok',
          tabBarIcon: ({ color, size }) => ( // Tambahkan ikon untuk Stock
            <Ionicons name="cube" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderScreen} // Tambahkan OrderScreen ke tab navigator admin
        options={{
          tabBarLabel: 'Pesanan',
          tabBarIcon: ({ color, size }) => ( // Tambahkan ikon untuk Orders
            <Ionicons name="cart" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Cashier"
        component={CashierScreen} // Tambahkan CashierScreen ke tab navigator admin
        options={{
          tabBarLabel: 'Kasir',
          tabBarIcon: ({ color, size }) => ( // Tambahkan ikon untuk Cashier
            <FontAwesome name="money" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="SalesReport"
        component={SalesReportScreen} // Tambahkan SalesReportScreen ke tab navigator admin
        options={{
          tabBarLabel: 'Penjualan',
          tabBarIcon: ({ color, size }) => ( // Tambahkan ikon untuk Sales Report
            <Ionicons name="analytics" color={color} size={size} />
          ),
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
};

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
          component={UserTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminTabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
