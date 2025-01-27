import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, TextInput, SectionList, Animated } from 'react-native';
import { firebase } from '../firebaseConfig';
import colors from '../assets/colors';
import { useNavigation } from '@react-navigation/native';

const CashierScreen = () => {
  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const db = firebase.firestore();
  const cartHeight = useState(new Animated.Value(0))[0];
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
    const unsubscribeFoods = db.collection('foods').onSnapshot((snapshot) => {
      const foodItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedFoods = foodItems.sort((a, b) => a.name.localeCompare(b.name)); // Sortir makanan secara alfabetis
      setFoods(sortedFoods);
    });

    const unsubscribeDrinks = db.collection('drinks').onSnapshot((snapshot) => {
      const drinkItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedDrinks = drinkItems.sort((a, b) => a.name.localeCompare(b.name)); // Sortir minuman secara alfabetis
      setDrinks(sortedDrinks);
    });

    return () => {
      unsubscribeFoods();
      unsubscribeDrinks();
    };
  }, [db]);

  const formatPrice = (price) => {
    return price ? `Rp.${parseInt(price).toLocaleString('id-ID')}` : 'Rp.0';
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, change) => {
    setCart((prevCart) => {
      return prevCart.map((item) => 
        item.id === itemId
          ? { ...item, quantity: Math.max(item.quantity + change, 1) } // Pastikan kuantitas tidak kurang dari 1
          : item
      );
    });
  };

  const calculateTotal = () => {
    const totalWithoutTax = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const calculatedTax = totalWithoutTax * 0.10; // Pajak 10%
    const totalWithTax = totalWithoutTax + calculatedTax;

    setTotal(totalWithTax);  // Total sudah termasuk pajak
    setTax(calculatedTax);  // Pajak tetap dihitung, tapi tidak ditampilkan
  };

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart is empty', 'Please add items to the cart before checking out.');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Total: ${formatPrice(total)}\nTax (10%): ${formatPrice(tax)}\nDo you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => completeCheckout() },
      ],
      { cancelable: false }
    );
  };

  const completeCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart is empty', 'Please add items before payment.');
      return;
    }

    const saleData = {
      date: new Date().toLocaleDateString(),
      total: total,
      items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    db.collection('sales').add(saleData)
      .then(() => {
        setCart([]);
        setTotal(0);
        setTax(0);
        Alert.alert('Success', 'Payment completed and sales recorded!');
      })
      .catch((error) => {
        console.error("Error adding sale: ", error);
        Alert.alert('Error', 'There was an error saving the sale.');
      });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => addToCart(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.cartItemText}>{item.name} x{item.quantity}</Text>
      <Text style={styles.cartItemText}>{formatPrice(item.price * item.quantity)}</Text>

      {/* Tombol untuk mengurangi kuantitas */}
      <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
        <Text style={styles.quantityButton}>-</Text>
      </TouchableOpacity>

      {/* Tombol untuk menambah kuantitas */}
      <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
        <Text style={styles.quantityButton}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <Text style={styles.removeButton}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const filterItems = (items) => {
    if (!searchQuery) return items;
    // Filter item berdasarkan searchQuery dan urutkan berdasarkan abjad
    return items
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name)); // Menambahkan urutan abjad
  };
  

  const sections = [
    {
      title: 'Foods',
      data: filterItems(foods),
    },
    {
      title: 'Drinks',
      data: filterItems(drinks),
    },
  ];

  const toggleCart = () => {
    const toValue = isCartExpanded ? 0 : 200;
    setIsCartExpanded(!isCartExpanded);

    Animated.timing(cartHeight, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        style={styles.list}
      />

      {/* Tampilan total sekarang bisa ditekan untuk memunculkan cart */}
      <TouchableOpacity onPress={toggleCart} style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: {formatPrice(total)}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.cartListContainer, { height: cartHeight }]}>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={renderCartItem}
          style={styles.cartList}
        />
      </Animated.View>

      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Pay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: 'black',
  },
  list: {
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
  },
  price: {
    fontSize: 14,
    color: colors.secondary,
  },
  cartListContainer: {
    overflow: 'hidden',
    marginBottom: 20,
  },
  cartList: {
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 1,
  },
  cartItemText: {
    fontSize: 14,
  },
  removeButton: {
    color: 'red',
    fontSize: 14,
  },
  quantityButton: {
    fontSize: 20,
    color: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  totalContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  checkoutButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CashierScreen;
