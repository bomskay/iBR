import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { firebase } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import colors from '../assets/colors';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = firebase.firestore();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Ikan Bakar Roong',
      headerStyle: {
        backgroundColor: colors.base,
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <Image
          source={require('../assets/ibricon.png')}
          style={{ width: 50, height: 50, marginLeft: 20, marginRight: -5 }}
          resizeMode="contain"
        />
      ),
    });
  }, [navigation]);

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

  const formatPrice = (price) => {
    return `Rp.${parseInt(price).toLocaleString('id-ID')}`;
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await db.collection('orders').doc(orderId).update({ status });
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const handleDeleteOrder = async (id, items) => {
    try {
      await Promise.all(items.map(async (orderItem) => {
        const stockDoc = orderItem.type === 'food'
          ? db.collection('foods').doc(orderItem.id)
          : db.collection('drinks').doc(orderItem.id);

        const stockSnapshot = await stockDoc.get();
        if (stockSnapshot.exists) {
          const stockData = stockSnapshot.data();
          const newQuantity = stockData.quantity - orderItem.quantity;

          await stockDoc.update({ quantity: newQuantity });
        }
      }));

      await db.collection('orders').doc(id).delete();
      Alert.alert("Order Deleted", "The order has been deleted successfully.");
    } catch (error) {
      Alert.alert("Error deleting order", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderText}>Order ID: {item.id}</Text>
            <Text style={styles.orderText}>User: {item.userName || "Unknown User"}</Text>
            <Text style={styles.orderText}>Status: {item.status}</Text>
            {Array.isArray(item.items) && item.items.length > 0 ? (
              item.items.map((orderItem, index) => (
                <Text key={index} style={styles.orderText}>
                  {orderItem.name} x {orderItem.quantity} - {formatPrice(orderItem.price * orderItem.quantity)}
                </Text>
              ))
            ) : (
              <Text style={styles.orderText}>No items in this order.</Text>
            )}
            <Text style={styles.totalText}>
              Total: {formatPrice(item.items?.reduce((total, orderItem) => total + orderItem.price * orderItem.quantity, 0) || 0)}
            </Text>
            <View style={styles.buttonContainer}>
              {item.status === 'pending' && (
                <TouchableOpacity onPress={() => updateOrderStatus(item.id, 'Diproses')} style={styles.button}>
                  <Text style={styles.buttonText}>Orderan Diproses</Text>
                </TouchableOpacity>
              )}
              {item.status === 'Diproses' && (
                <TouchableOpacity onPress={() => updateOrderStatus(item.id, 'Selesai')} style={styles.button}>
                  <Text style={styles.buttonText}>Orderan Selesai</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDeleteOrder(item.id, item.items)} style={styles.button}>
                <Text style={styles.buttonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    padding: 10,
    marginVertical: 5,
  },
  orderText: {
    fontSize: 16,
    color: '#333',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderScreen;
