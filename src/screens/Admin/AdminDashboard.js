import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { firebase } from '../../../firebaseConfig';
import DashboardCard from '../../components/dashboardAdmin/DashboardCard';

const AdminDashboard = ({ navigation }) => {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [salesToday, setSalesToday] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

  const db = firebase.firestore();

  useEffect(() => {
    // Menghitung pesanan yang masih 'pending'
    const unsubscribeOrders = db.collection('orders')
      .where('status', '==', 'pending')
      .onSnapshot(snapshot => setPendingOrders(snapshot.size));

    // Menghitung total penjualan hari ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const unsubscribeSales = db.collection('sales')
      .where('timestamp', '>=', startOfDay)
      .onSnapshot(snapshot => {
        const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0);
        setSalesToday(total);
      });
      
    // Menghitung menu yang stoknya sedikit
    const unsubscribeStock = db.collection('products')
      .where('quantity', '<=', 5)
      .onSnapshot(snapshot => setLowStockItems(snapshot.size));

    return () => {
      unsubscribeOrders();
      unsubscribeSales();
      unsubscribeStock();
    };
  }, []);

  const formatPrice = (price) => `Rp${parseInt(price).toLocaleString('id-ID')}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Dashboard Hari Ini</Text>
        <View style={styles.row}>
          <DashboardCard
            title="Pesanan Baru"
            value={pendingOrders}
            onPress={() => navigation.navigate('Kelola Pesanan')}
          />
          <DashboardCard
            title="Stok Tipis"
            value={lowStockItems}
            onPress={() => navigation.navigate('Kelola Stok')}
          />
        </View>
        <View style={styles.fullWidthCard}>
          <DashboardCard
            title="Total Penjualan"
            value={formatPrice(salesToday)}
            onPress={() => navigation.navigate('Laporan Penjualan')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  fullWidthCard: {
      flexDirection: 'row',
  }
});

export default AdminDashboard;