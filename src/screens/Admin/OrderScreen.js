import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { firebase } from '../../../firebaseConfig';
import OrderCard from '../../components/orderAdmin/OrderCard';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = firebase.firestore();

  useEffect(() => {
    const unsubscribe = db.collection('orders')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const orderList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(orderList);
        setLoading(false);
      });
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, status, order) => {
    if (!order || !order.userId) {
      Alert.alert("Peringatan", "Status pesanan diubah, tapi notifikasi gagal dikirim (data tidak lengkap).");
      await db.collection('orders').doc(orderId).update({ status });
      return;
    }

    const orderRef = db.collection('orders').doc(orderId);
    const userId = order.userId;

    try {
      const batch = db.batch();
      batch.update(orderRef, { status });

      const notificationRef = db.collection('users').doc(userId).collection('notifications').doc();
      batch.set(notificationRef, {
        title: "iBR",
        body: `Pesanan anda telah ${status}`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isRead: false,
        type: 'status_update',
      });

      await batch.commit();

    } catch (error) {
      Alert.alert("Error", "Gagal memperbarui status pesanan.");
    }
  };

  const handleDeleteOrder = async (id, items) => {
    Alert.alert(
      "Hapus Pesanan", "Apakah Anda yakin?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          onPress: async () => {
            try {
                const batch = db.batch();
                for (const orderItem of items) {
                    const collectionName = orderItem.category;
                    if (collectionName) {
                        const stockDocRef = db.collection('products').doc(orderItem.id);
                        batch.update(stockDocRef, { quantity: firebase.firestore.FieldValue.increment(orderItem.quantity) });
                    }
                }
                const orderRef = db.collection('orders').doc(id);
                batch.delete(orderRef);
                await batch.commit();
                Alert.alert("Sukses", "Pesanan telah berhasil dihapus.");
            } catch (error) {
                Alert.alert("Error", "Gagal menghapus pesanan: " + error.message);
            }
          },
          style: "destructive" 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text>Memuat pesanan...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard 
            item={item}
            onUpdateStatus={(orderId, status) => updateOrderStatus(orderId, status, item)}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Belum ada pesanan.</Text>}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 16 },
    emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 50 }
});

export default OrderScreen;
