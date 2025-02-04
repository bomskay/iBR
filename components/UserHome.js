import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, Alert, TextInput, BackHandler, Button } from 'react-native';
import { firebase } from '../firebaseConfig';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import IconFeather from 'react-native-vector-icons/Feather';
import colors from '../assets/colors';

const UserHome = () => {
  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [cart, setCart] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [userName, setUserName] = useState("unknown user");
  const [searchQuery, setSearchQuery] = useState(""); // State untuk kata kunci pencarian

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
    const unsubscribeFoods = db.collection('foods').onSnapshot((snapshot) => {
      const foodItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      foodItems.sort((a, b) => a.name.localeCompare(b.name)); // Sortir berdasarkan nama
      setFoods(foodItems);
    });
  
    const unsubscribeDrinks = db.collection('drinks').onSnapshot((snapshot) => {
      const drinkItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      drinkItems.sort((a, b) => a.name.localeCompare(b.name)); // Sortir berdasarkan nama
      setDrinks(drinkItems);
    });
  
    const user = firebase.auth().currentUser;
    if (user) {
      const uid = user.uid;
      db.collection('users').doc(uid).get().then((doc) => {
        if (doc.exists) {
          setUserName(doc.data().name || user.email);
        } else {
          setUserName(user.email);
        }
      }).catch((error) => {
        console.error("Error fetching user data:", error);
      });
    }
  
    return () => {
      unsubscribeFoods();
      unsubscribeDrinks();
    };
  }, []);
  

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const filteredFoods = foods.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDrinks = drinks.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const addToCart = (item) => {
    const quantity = quantities[item.id] || 0;
    if (quantity === 0) {
      Alert.alert("Tolong Tambahkan Jumlah", "Pemesanan tidak bisa dilakukan apabila jumlahnya 0.");
      return;
    }

    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...item, quantity }]);
    }

    setQuantities({ ...quantities, [item.id]: 0 });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Keranjang Pesanan Kosong", "Tambahkan menu sebelum melakukan pemesanan.");
      return;
    }
  
    if (!userName) {
      Alert.alert("User name is required", "Please provide a valid user name.");
      return;
    }
  
    try {
      const batch = db.batch();
      const orderId = new Date().toISOString(); // Membuat ID menggunakan waktu saat ini
      const orderRef = db.collection('orders').doc(orderId); // Menggunakan orderId sebagai referensi
  
      for (const item of cart) {
        const foodRef = db.collection('foods').doc(item.id);
        const drinkRef = db.collection('drinks').doc(item.id);
        
        const doc = await foodRef.get();
        if (doc.exists) {
          const currentStock = doc.data().quantity;
          if (currentStock >= item.quantity) {
            batch.update(foodRef, { quantity: currentStock - item.quantity });
          } else {
            Alert.alert("Stock error", `Not enough stock for ${item.name}.`);
            return;
          }
        } else {
          const drinkDoc = await drinkRef.get();
          if (drinkDoc.exists) {
            const currentStock = drinkDoc.data().quantity;
            if (currentStock >= item.quantity) {
              batch.update(drinkRef, { quantity: currentStock - item.quantity });
            } else {
              Alert.alert("Stock error", `Not enough stock for ${item.name}.`);
              return;
            }
          }
        }
      }
  
      batch.set(orderRef, {
        items: cart,
        userName: userName || "unknown user",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
      });
  
      await batch.commit();
  
      Alert.alert("Pesanan Telah Dibuat!", "Mohon menunggu ya.");
      setCart([]);
      setModalVisible(false);
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Gagal membuat pesanan", error.message);
    }
  };
  

  const handleQuantityChange = (id, value) => {
    const numValue = parseInt(value, 10);
    setQuantities({ ...quantities, [id]: numValue >= 0 ? numValue : 0 });
  };

  const incrementQuantity = (id) => {
    setQuantities({ ...quantities, [id]: (quantities[id] || 0) + 1 });
  };

  const decrementQuantity = (id) => {
    const currentQuantity = quantities[id] || 0;
    if (currentQuantity > 0) {
      setQuantities({ ...quantities, [id]: currentQuantity - 1 });
    }
  };

  const formatPrice = (price) => `Rp.${parseInt(price).toLocaleString('id-ID')}`;

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      
      {/* Quantity Controls */}
      <View style={styles.quantityContainer}>
      <TouchableOpacity style={styles.plusminusButton} onPress={() => decrementQuantity(item.id)}>
        <Text style={styles.plusminusText}>−</Text>
      </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          value={`${quantities[item.id] || 0}`}
          keyboardType="numeric"
          onChangeText={(value) => handleQuantityChange(item.id, value)}
        />
        <TouchableOpacity style={styles.plusminusButton} onPress={() => incrementQuantity(item.id)}>
        <Text style={styles.plusminusText}>+</Text>
      </TouchableOpacity>
      </View>
      
      {/* Add to Cart Button */}
      <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
        <Text style={styles.addtocartbuttonText}>Tambahkan</Text>
      </TouchableOpacity>
    </View>
  );
  

  const renderSectionHeader = (title) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const groupedData = [
    { title: 'Makanan', data: foods },
    { title: 'Minuman', data: drinks },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Selamat datang, {userName}!</Text>

      {/* Input Pencarian */}
      <TextInput
        style={styles.searchInput}
        placeholder="Cari makanan atau minuman"
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {/* Cart Icon */}
      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        style={styles.cartButton}>
        <IconFeather name="shopping-cart" size={30} color={colors.secondary} />
        <TouchableOpacity style={styles.cartCount}>
          <Text style={styles.cartcountText}>{cart.length}</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Display Foods and Drinks in One FlatList */}
      <FlatList
        data={[{ title: 'Makanan', data: filteredFoods }, { title: 'Minuman', data: filteredDrinks }]}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View>
            {renderSectionHeader(item.title)}
            <FlatList
              data={item.data}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              numColumns={2}
              key={`column-${item.data.length}`}
              scrollEnabled={false}
            />
          </View>
        )}
      />

      {/* Modal for Cart */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay} />
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Keranjang Anda</Text>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.itemText}>{item.name} x {item.quantity}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <Text style={styles.totalText}>Total: {formatPrice(calculateTotalPrice())}</Text>
          <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
            <Text style={styles.buttonText}>Buat Pesanan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop:0,
    backgroundColor: '#f9f9f9',
  },
searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 16,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute', // Mengatur posisi absolut
    top: 18, // Jarak dari atas
    right: 30, // Jarak dari kanan
  },
  cartCount: {
    width: 20, // Lebar lingkaran
    height: 20, // Tinggi lingkaran sama dengan lebar
    borderRadius: 10, // Setengah dari width/height untuk membuatnya jadi lingkaran
    backgroundColor: 'black', // Warna background lingkaran
    justifyContent: 'center', // Menempatkan teks di tengah secara vertikal
    alignItems: 'center', // Menempatkan teks di tengah secara horizontal
    marginLeft:-15,
    marginTop:-20,
  },
  cartcountText:{
fontSize: 15,
fontWeight:'bold',
    color:colors.secondary,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 2,
    maxWidth: '50%',
    justifyContent: 'space-between', // Mengatur ruang antar elemen
  },

  image: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
  price: {
    fontSize: 16,
    color: '#2c3e50',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 40,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },

  placeOrderButton: {
    backgroundColor: colors.secondary,
    borderRadius: 5, // Sudut melengkung
    padding: 15,
    alignItems: 'center',
    marginTop: 20, // Jarak atas untuk pemisahan
    width: '100%', // Memastikan tombol mengambil lebar penuh
  },
  closeButton: {
    backgroundColor: 'gray',
    borderRadius: 5, // Sudut melengkung
    padding: 15,
    alignItems: 'center',
    marginTop: 10, // Jarak atas untuk pemisahan
    width: '100%', // Memastikan tombol mengambil lebar penuh
  },
  buttonText: {
    color: '#fff', // Warna teks tombol
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },

  itemText:{
    fontSize: 16,
  },

  removeText: {
    color: 'white',
    backgroundColor: '#dc3545', // Warna latar belakang merah untuk ikon logout
    borderRadius: 5, // Membuat ikon logout bulat
    padding:4,
    fontSize:13,
  },
  totalText: {
    marginVertical: 10,
    fontSize: 17,
    fontWeight: 'bold',
  },
  plusminusButton: {
    backgroundColor: '#fff', // Ganti dengan warna yang diinginkan
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // Tambahkan gaya lain yang diperlukan
  },
  plusminusText: {
    color: colors.secondary, // Ganti dengan warna teks yang diinginkan
    fontSize: 18,
    fontWeight:'condensedBold'
  },

  addToCartButton: {
    backgroundColor: colors.secondary, // Contoh warna hijau
    padding: 12,
    borderRadius: 5,
    alignItems: 'center', // Pusatkan teks dalam tombol
  },
  addtocartbuttonText: {
    color: '#FFFFFF', // Warna teks
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

export default UserHome;