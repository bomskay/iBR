import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { firebase } from '../../../firebaseConfig';
import * as Notifications from 'expo-notifications';
import AdminDrawerContent from '../AdminDrawerContent';
import AdminDashboard from '../../screens/Admin/AdminDashboard';
import AdminHome from '../../screens/Admin/AdminHome';
import StockScreen from '../../screens/Admin/StockScreen';
import OrderScreen from '../../screens/Admin/OrderScreen';
import CashierScreen from '../../screens/Admin/CashierScreen';
import SalesReportScreen from '../../screens/Admin/SalesReportScreen';
import colors from '../../../assets/colors';

const Drawer = createDrawerNavigator();

const AdminNavigator = () => {
  useEffect(() => {
    let unsubscribe = () => {};

    const authSubscriber = firebase.auth().onAuthStateChanged(user => {
      
      // Hentikan listener lama setiap kali status auth berubah
      unsubscribe();
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        userRef.get().then(doc => {
          // Hanya pasang listener jika pengguna adalah admin
          if (doc.exists && doc.data().isAdmin) {
            unsubscribe = firebase.firestore()
              .collection('users').doc(user.uid).collection('notifications')
              .where('isRead', '==', false)
              .where('type', '==', 'new_order')
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
          }
        });
      }
    });

    // Fungsi cleanup utama
    return () => {
      authSubscriber();
      unsubscribe();
    };
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />} 
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.base,
        },
        headerTintColor: '#000',
        drawerActiveTintColor: colors.secondary,
        drawerInactiveTintColor: '#333',
        drawerActiveBackgroundColor: '#f0f0f0',
      }}
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboard} />
      <Drawer.Screen name="Kelola Menu" component={AdminHome} />
      <Drawer.Screen name="Kelola Stok" component={StockScreen} />
      <Drawer.Screen name="Kelola Pesanan" component={OrderScreen} />
      <Drawer.Screen name="Kasir" component={CashierScreen} />
      <Drawer.Screen name="Laporan Penjualan" component={SalesReportScreen} />
    </Drawer.Navigator>
  );
};

export default AdminNavigator;
