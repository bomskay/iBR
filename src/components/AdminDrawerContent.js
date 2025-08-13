// src/components/admin/AdminDrawerContent.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { firebase } from '../../firebaseConfig';
import Icon from 'react-native-vector-icons/Feather';

const AdminDrawerContent = (props) => {
  const handleLogout = () => {
    firebase.auth().signOut()
      .then(() => {
        // Gunakan 'replace' agar admin tidak bisa kembali ke halaman sebelumnya setelah logout
        props.navigation.replace('SignIn');
      })
      .catch(error => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {/* Bagian ini akan merender semua screen yang Anda daftarkan di Drawer.Navigator */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Ini adalah tombol logout custom kita di bagian bawah */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={22} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // Warna abu-abu terang
  },
  logoutText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#EF4444', // Warna merah
  }
});

export default AdminDrawerContent;