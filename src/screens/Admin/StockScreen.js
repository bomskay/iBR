// src/screens/StockScreen.js (Fixed)
import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, StyleSheet, Alert, TextInput,StatusBar } from 'react-native';
import { firebase } from '../../../firebaseConfig';
import StockList from '../../components/stockAdmin/StockList';

const StockScreen = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const db = firebase.firestore(); // <-- Pindahkan deklarasi db ke sini

  useEffect(() => {
    // 'db' sekarang sudah bisa diakses di sini
    const unsubscribe = db.collection('products')
      .orderBy('name')
      .onSnapshot((snapshot) => {
        const allProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(allProducts);
      });

    return () => unsubscribe();
  }, []); // dependensi array tetap kosong

  const handleStockUpdate = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      Alert.alert("Input tidak valid", "Harap masukkan angka yang benar untuk stok.");
      return;
    }

    // 'db' sekarang sudah bisa diakses di sini juga
    db.collection('products').doc(productId).update({
      quantity: quantity
    }).catch(error => {
      console.error("Error updating stock: ", error);
      Alert.alert("Error", "Gagal memperbarui stok.");
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = [
    { title: 'Makanan', data: filteredProducts.filter(p => p.category === 'food') },
    { title: 'Minuman', data: filteredProducts.filter(p => p.category === 'drink') },
    { title: 'Tambahan', data: filteredProducts.filter(p => p.category === 'tambahan') },
  ].filter(section => section.data.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama menu..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <StockList
          sections={sections}
          onStockUpdate={handleStockUpdate}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, paddingHorizontal: 16 },
  searchInput: { height: 48, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: '#fff', fontSize: 16 },
});

export default StockScreen;