// src/screens/CashierScreen.js (Revised)
import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, SafeAreaView, StyleSheet,StatusBar } from 'react-native';
import { firebase } from '../../../firebaseConfig';
import MenuList from '../../components/cashierAdmin/MenuList';
import ShoppingCart from '../../components/cashierAdmin/ShoppingCart';

const CashierScreen = () => {
  const [products, setProducts] = useState([]); // <-- 1. State tunggal untuk semua produk
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const db = firebase.firestore();

  // 2. Mengambil data dari satu koleksi 'products'
  useEffect(() => {
    const unsubscribe = db.collection('products').onSnapshot(snap => {
      const allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(allProducts);
    });
    return () => unsubscribe();
  }, []);
  
  // useEffect untuk kalkulasi total tidak berubah, sudah benar.
  useEffect(() => {
    const totalWithoutTax = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const calculatedTax = totalWithoutTax * 0.10; // Pajak 10%
    setTotal(totalWithoutTax + calculatedTax);
  }, [cart]);

  // 3. Logika addToCart menjadi jauh lebih simpel
  const addToCart = (item) => {
    setCart(prevCart => {
      const existing = prevCart.find(ci => ci.id === item.id);
      if (existing) {
        return prevCart.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      // Tidak perlu lagi menentukan tipe, karena 'item' sudah lengkap
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart(prevCart => prevCart.map(item =>
      item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const taxAmount = total - cart.reduce((s, i) => s + i.price * i.quantity, 0);
    Alert.alert('Konfirmasi Pembayaran', `Total: Rp${Math.round(total).toLocaleString('id-ID')}\n(Termasuk Pajak: Rp${Math.round(taxAmount).toLocaleString('id-ID')})`,
      [{ text: 'Batal' }, { text: 'Bayar', onPress: completeCheckout }]
    );
  };
  
  // 4. Proses checkout sekarang konsisten menargetkan koleksi 'products'
  const completeCheckout = () => {
    const saleData = {
      items: cart,
      total: total,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      cashierId: firebase.auth().currentUser?.uid,
    };
    const batch = db.batch();
    const saleRef = db.collection('sales').doc();
    batch.set(saleRef, saleData);

    cart.forEach(item => {
      const itemRef = db.collection('products').doc(item.id); // <-- Selalu ke 'products'
      batch.update(itemRef, { quantity: firebase.firestore.FieldValue.increment(-item.quantity) });
    });

    batch.commit().then(() => {
      setCart([]);
      Alert.alert('Sukses', 'Pembayaran berhasil!');
    }).catch(error => Alert.alert('Error', error.message));
  };
  
  // 5. Filter dan pengelompokan dari state 'products'
  const filteredProducts = products.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sections = [
    { title: 'Makanan', data: filteredProducts.filter(p => p.category === 'food') },
    { title: 'Minuman', data: filteredProducts.filter(p => p.category === 'drink') },
    { title: 'Tambahan', data: filteredProducts.filter(p => p.category === 'tambahan') },
  ].filter(s => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari menu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.listContainer}>
            <MenuList sections={sections} onAddToCart={addToCart} />
        </View>
        <ShoppingCart 
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          total={total}
          onCheckout={handleCheckout}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { flex: 1 },
    searchContainer: { padding: 16, paddingBottom: 0 },
    searchInput: { height: 48, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 16, backgroundColor: '#fff' },
    listContainer: { flex: 1, paddingHorizontal: 16 }
});

export default CashierScreen;