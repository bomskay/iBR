// src/screens/Admin/AdminHome.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, StyleSheet, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { firebase } from '../../../firebaseConfig';
import ProductForm from '../../components/adminHome/ProductForm';
import AdminProductList from '../../components/adminHome/AdminProductList';
import colors from '../../../assets/colors';

const AdminHome = () => {
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', quantity: '1', category: 'food' });
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const db = firebase.firestore();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    const unsubscribe = db.collection('products').orderBy('name').onSnapshot((snapshot) => {
        const allItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setItems(allItems);
    });
    return () => unsubscribe();
  }, []);

  const handleAddOrUpdate = () => {
    if (!form.name || !form.price) {
      Alert.alert('Error', 'Nama dan Harga tidak boleh kosong.');
      return;
    }
    const user = firebase.auth().currentUser;
    const collectionName = 'products';

    if (editId) {
      const itemData = {
        name: form.name, description: form.description, price: parseInt(form.price),
        imageUrl: form.imageUrl || '', quantity: parseInt(form.quantity) || 1, category: form.category,
        updatedBy: user ? user.uid : null, updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      db.collection(collectionName).doc(editId).update(itemData)
        .then(resetForm)
        .catch(console.error);
    } else {
      const itemData = {
        name: form.name, description: form.description, price: parseInt(form.price),
        imageUrl: form.imageUrl || '', quantity: parseInt(form.quantity) || 1, category: form.category,
        createdBy: user ? user.uid : null, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      db.collection(collectionName).add(itemData)
        .then(() => {
          Alert.alert('Sukses', 'Menu berhasil ditambahkan.');
          resetForm();
        })
        .catch(console.error);
    }
  };

  const handleEdit = (item) => {
    setForm({ ...item, price: String(item.price), quantity: String(item.quantity) });
    setEditId(item.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    if (!id) return;
    db.collection('products').doc(id).delete().catch(console.error);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', imageUrl: '', quantity: '1', category: 'food' });
    setEditId(null);
  };
  
  const groupedItems = () => {
    const foods = items.filter(i => i.category === 'food').sort((a,b) => a.name.localeCompare(b.name));
    const drinks = items.filter(i => i.category === 'drink').sort((a,b) => a.name.localeCompare(b.name));
    const tambahan = items.filter(i => i.category === 'tambahan').sort((a,b) => a.name.localeCompare(b.name));
    const result = [];
    if (foods.length > 0) result.push({ title: 'Makanan', data: foods });
    if (drinks.length > 0) result.push({ title: 'Minuman', data: drinks });
    if (tambahan.length > 0) result.push({ title: 'Tambahan', data: tambahan });
    return result;
  };

  const ListHeader = () => (
    <View>
        <TouchableOpacity onPress={() => setIsFormVisible(!isFormVisible)} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>
                {isFormVisible ? 'Tutup Form' : 'Buka Form Tambah Menu'}
            </Text>
        </TouchableOpacity>
        {isFormVisible && (
            <ProductForm
                form={form}
                setForm={setForm}
                handleAddOrUpdate={handleAddOrUpdate}
                editId={editId}
                resetForm={resetForm}
            />
        )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminProductList
          items={groupedItems()}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          ListHeaderComponent={<ListHeader />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB'},
    toggleButton: { 
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    toggleButtonText: { textAlign: 'center', color: colors.secondary, fontWeight: 'bold', fontSize: 16 }
});

export default AdminHome;