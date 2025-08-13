// src/screens/AccountInformationScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StyleSheet, FlatList, StatusBar } from 'react-native';
import { firebase } from '../../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import UserInfoCard from '../../components/userHome/UserInfoCard';
import OrderHistoryCard from '../../components/userHome/OrderHistoryCard';

const AccountInformationScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [userIconUri, setUserIconUri] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const db = firebase.firestore();

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      const userUnsubscribe = db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            setUserInfo(data);
            setUserIconUri(data.iconUri || 'https://dummyimage.com/100x100/000/fff&text=U');
            fetchOrdersByUserId(user.uid);
          }
          setLoading(false);
        });
      return () => userUnsubscribe();
    }
  }, []);

  const fetchOrdersByUserId = (userId) => {
    const ordersUnsubscribe = db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      });
    return () => ordersUnsubscribe();
  };

  const handleIconChange = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin dibutuhkan', 'Izinkan akses ke galeri.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      const user = firebase.auth().currentUser;
      if (user) {
        const userRef = db.collection('users').doc(user.uid);
        userRef.update({ iconUri: selectedImageUri })
          .then(() => Alert.alert("Berhasil", "Ikon Anda telah diperbarui!"))
          .catch((error) => console.error("Error:", error));
      }
    }
  };

  const handleLogout = () => {
    firebase.auth().signOut().then(() => {
      navigation.replace('SignIn');
    });
  };

  // FUNGSI BARU UNTUK MENANGANI PEMBATALAN
  const handleCancelOrder = (order) => {
    Alert.alert(
      "Konfirmasi Pembatalan",
      "Apakah Anda yakin ingin membatalkan pesanan ini? Stok akan dikembalikan.",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          onPress: async () => {
            try {
              const batch = db.batch();
              const orderRef = db.collection('orders').doc(order.id);

              // 1. Kembalikan stok
              for (const item of order.items) {
                const productRef = db.collection('products').doc(item.id);
                batch.update(productRef, {
                  quantity: firebase.firestore.FieldValue.increment(item.quantity)
                });
              }

              // 2. Ubah status pesanan menjadi 'dibatalkan'
              batch.update(orderRef, { status: 'dibatalkan' });

              // 3. Kirim notifikasi ke admin (opsional)
              const adminsSnapshot = await db.collection('users').where('isAdmin', '==', true).get();
              adminsSnapshot.forEach(adminDoc => {
                const notificationRef = db.collection('users').doc(adminDoc.id).collection('notifications').doc();
                batch.set(notificationRef, {
                  title: "Pesanan Dibatalkan",
                  body: `Pesanan dari ${order.userName} telah dibatalkan.`,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                  isRead: false,
                });
              });

              await batch.commit();
              Alert.alert("Berhasil", "Pesanan Anda telah dibatalkan.");
            } catch (error) {
              console.error("Error cancelling order:", error);
              Alert.alert("Error", "Gagal membatalkan pesanan.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Memuat informasi...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out" size={24} color="#fff" />
        </TouchableOpacity>
        
        <UserInfoCard
          userInfo={userInfo}
          userIconUri={userIconUri}
          onIconChange={handleIconChange}
        />
        
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Riwayat Pesanan Anda:</Text>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderHistoryCard 
                item={item}
                onCancelOrder={handleCancelOrder} // Teruskan fungsi pembatalan
              />
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Anda belum memiliki pesanan.</Text>}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6'},
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 8, color: '#4B5563' },
  logoutButton: { position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: '#EF4444', padding: 8, borderRadius: 9999, elevation: 5 },
  historyContainer: { flex: 1, marginTop: 20 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6B7280' },
});

export default AccountInformationScreen;
