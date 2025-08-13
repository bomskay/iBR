import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, Alert, StyleSheet, StatusBar, BackHandler} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { firebase } from '../../../firebaseConfig';
import Icon from 'react-native-vector-icons/Feather';
import ProductCard from '../../components/userHome/ProductCard';
import CartModal from '../../components/userHome/CartModal';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const UserHome = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Pelanggan");
  const db = firebase.firestore();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );
  
  useEffect(() => {
    const unsubscribeProducts = db.collection('products').orderBy('name').onSnapshot((snapshot) => {
      const productItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(productItems);
    });

    const user = firebase.auth().currentUser;
    if (user) {
      db.collection('users').doc(user.uid).get().then((doc) => {
        if (doc.exists) {
          setUserName(doc.data().name || user.email);
        }
      });
    }
    
    return () => {
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const unsubscribe = db.collection('users').doc(user.uid).collection('notifications')
      .where('isRead', '==', false)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {}
        });
      });

    return () => unsubscribe();
  }, []);

  const handleQuantityChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const addToCart = (item) => {
    const quantity = parseInt(quantities[item.id] || 0);
    if (quantity <= 0) {
      Alert.alert("", "Harap masukkan jumlah menu.");
      return;
    }
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
    handleQuantityChange(item.id, 0);
  };
  
  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Keranjang Kosong", "Tambahkan menu sebelum memesan.");
      return;
    }
    const user = firebase.auth().currentUser;
    if (!user) {
      Alert.alert("Error", "Anda harus login untuk membuat pesanan.");
      return;
    }

    try {
      const batch = db.batch();
      const orderRef = db.collection('orders').doc();

      for (const item of cart) {
        const productRef = db.collection('products').doc(item.id);
        batch.update(productRef, { 
          quantity: firebase.firestore.FieldValue.increment(-item.quantity) 
        });
      }

      const now = new Date();
      const cancellableUntil = new Date(now.getTime() + 5 * 60 * 1000);

      batch.set(orderRef, {
        items: cart,
        userName: userName,
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        cancellableUntil: firebase.firestore.Timestamp.fromDate(cancellableUntil),
      });

      const adminsSnapshot = await db.collection('users').where('isAdmin', '==', true).get();
      
      adminsSnapshot.forEach(adminDoc => {
        const adminId = adminDoc.id;
        const notificationRef = db.collection('users').doc(adminId).collection('notifications').doc();
        batch.set(notificationRef, {
          title: "iBR",
          body: `Pesanan baru dari ${userName} telah diterima.`,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          isRead: false,
          type: 'new_order',
        });
      });
    
      await batch.commit();
      
      Alert.alert("Pesanan Berhasil", "Pesanan Anda telah dibuat.");
      setCart([]);
      setModalVisible(false);

    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Gagal membuat pesanan. Stok mungkin tidak mencukupi.");
    }
  };

  const calculateTotalPrice = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const sections = [
    { title: 'Makanan', data: filteredProducts.filter(p => p.category === 'food') },
    { title: 'Minuman', data: filteredProducts.filter(p => p.category === 'drink') },
    { title: 'Tambahan', data: filteredProducts.filter(p => p.category === 'tambahan') },
  ].filter(section => section.data.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.welcomeText}>Selamat datang, <Text style={{fontWeight: 'bold'}}>{userName}</Text>!</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.cartIconContainer}>
                <Icon name="shopping-cart" size={30} color="black" />
                {cart.length > 0 && (
                <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cart.length}</Text></View>
                )}
            </TouchableOpacity>
        </View>

        <TextInput
            style={styles.searchInput}
            placeholder="Cari menu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
        />

        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View>
              {item.data.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <FlatList
                    data={item.data}
                    renderItem={({ item: productItem }) => (
                      <ProductCard
                        item={productItem}
                        quantity={quantities[productItem.id]}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={addToCart}
                      />
                    )}
                    keyExtractor={(productItem) => productItem.id}
                    numColumns={2} 
                    scrollEnabled={false}
                  />
                </>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <CartModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        cart={cart}
        onRemoveFromCart={(id) => setCart(cart.filter(item => item.id !== id))}
        onPlaceOrder={placeOrder}
        totalPrice={calculateTotalPrice()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB'},
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 16 },
  welcomeText: { fontSize: 20 },
  cartIconContainer: { position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  searchInput: { height: 48, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 8, backgroundColor: '#F9FAFB', paddingVertical: 4 }
});

export default UserHome;
