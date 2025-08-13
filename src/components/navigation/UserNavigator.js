import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Octicons } from '@expo/vector-icons';
import { firebase } from '../../../firebaseConfig';
import * as Notifications from 'expo-notifications';

import UserHome from '../../screens/User/UserHome';
import AccountInformationScreen from '../../screens/User/AccountInformationScreen';
import colors from '../../../assets/colors';

const Tab = createBottomTabNavigator();

const UserNavigator = () => {
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    let notificationsUnsubscribe = () => {};
    let ordersUnsubscribe = () => {};

    const authSubscriber = firebase.auth().onAuthStateChanged(user => {
      // Hentikan listener lama setiap kali status auth berubah
      notificationsUnsubscribe();
      ordersUnsubscribe();
      setActiveOrderCount(0);

      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        userRef.get().then(doc => {
          if (doc.exists && !doc.data().isAdmin) {
            
            // Listener untuk notifikasi status update
            notificationsUnsubscribe = firebase.firestore()
              .collection('users').doc(user.uid).collection('notifications')
              .where('isRead', '==', false)
              .where('type', '==', 'status_update')
              .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                  if (change.type === 'added') {
                    const notificationData = change.doc.data();
                    Notifications.scheduleNotificationAsync({
                      content: {
                        title: notificationData.title,
                        body: notificationData.body,
                      },
                      trigger: null,
                    });
                    change.doc.ref.update({ isRead: true });
                  }
                });
              });

            // Listener untuk pesanan aktif (badge)
            ordersUnsubscribe = firebase.firestore()
              .collection('orders')
              .where('userId', '==', user.uid)
              .where('status', 'in', ['pending', 'Diproses'])
              .onSnapshot(snapshot => {
                setActiveOrderCount(snapshot.size);
              });
          }
        });
      }
    });

    // Fungsi cleanup utama
    return () => {
      authSubscriber();
      notificationsUnsubscribe();
      ordersUnsubscribe();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.inactive,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserHome}
        options={{ tabBarLabel: 'Beranda', tabBarIcon: ({ color, size }) => (<Octicons name="home" color={color} size={size} />) }}
      />
      <Tab.Screen
        name="AccountInformation"
        component={AccountInformationScreen}
        options={{
          tabBarLabel: 'Akun',
          tabBarIcon: ({ color, size }) => (<Octicons name="person" color={color} size={size} />),
          tabBarBadge: activeOrderCount > 0 ? activeOrderCount : null,
        }}
      />
    </Tab.Navigator>
  );
};

export default UserNavigator;
