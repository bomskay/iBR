import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { firebase } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import colors from '../assets/colors';
import * as ImagePicker from 'expo-image-picker';

const AccountInformationScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [userIconUri, setUserIconUri] = useState('https://dummyimage.com/100x100/000/fff&text=User');
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Ikan Bakar Roong',
      headerStyle: { backgroundColor: colors.base },
      headerTintColor: '#000',
      headerTitleStyle: { fontWeight: 'bold' },
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
    const user = firebase.auth().currentUser;

    if (user) {
      const userRef = firebase.firestore().collection('users').doc(user.uid);
      userRef.get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setUserInfo(data);
          setUserIconUri(data.iconUri || 'https://dummyimage.com/100x100/000/fff&text=User');
          fetchOrders(data.name || user.email);
        } else {
          console.log('Pengguna tidak ditemukan di database.');
        }
      }).catch((error) => {
        console.error("Error mendapatkan data pengguna:", error);
      });
    }
  }, []);

  const fetchOrders = (userName) => {
    const ordersRef = firebase.firestore().collection('orders')
      .where('userName', '==', userName)
      .orderBy('createdAt');

    ordersRef.onSnapshot((snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    }, (error) => {
      console.error("Error mendapatkan data pemesanan:", error);
    });
  };

  const handleIconChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin dibutuhkan', 'Izinkan akses ke galeri untuk memilih gambar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setUserIconUri(selectedImageUri);
      
      const user = firebase.auth().currentUser;
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        userRef.update({ iconUri: selectedImageUri }).catch((error) => {
          console.error("Error menyimpan ikon pengguna:", error);
        });
      }

      // Feedback sukses mengganti ikon
      Alert.alert("Berhasil", "Ikon Anda telah diperbarui!");
    }
  };

  const handleLogout = () => {
    firebase.auth().signOut().then(() => {
      navigation.replace('SignIn');
    }).catch((error) => {
      Alert.alert("Error", error.message);
    });
  };

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Memuat informasi pengguna...</Text>
        <ActivityIndicator size="large" color={colors.base} style={styles.loadingIndicator} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity onPress={handleIconChange}>
          <Image 
            source={{ uri: userIconUri }}
            style={styles.userIcon}
          />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nama Pengguna:</Text>
          <Text style={styles.value}>{userInfo.name}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userInfo.email}</Text>
        </View>
      </View>

      <Text style={styles.label}>Pesanan Anda:</Text>
      {orders.length === 0 ? (
        <Text style={styles.value}>Anda belum memiliki pesanan. Yuk, mulai pesan sekarang!</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <Text style={styles.orderText}>ID Pemesanan: {item.id}</Text>
              <Text style={styles.orderText}>Status Pemesanan: {item.status}</Text>
              <Text style={styles.orderText}>Dibuat pada: {item.createdAt?.toDate().toLocaleString()}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
        <Icon name="log-out" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20, // Lebih rounded
    elevation: 5, // Efek bayangan yang lebih halus
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  userIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  infoContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  orderItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderText: {
    fontSize: 14,
    color: '#555',
  },
  logoutButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    backgroundColor: colors.secondary,
    borderRadius: 5,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  loadingIndicator: {
    marginTop: 10,
  },
});

export default AccountInformationScreen;
