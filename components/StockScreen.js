// components/StockScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet,Image } from 'react-native';
import { firebase } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import colors from '../assets/colors';

const StockScreen = () => {
  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Ikan Bakar Roong', // Judul header
      headerStyle: {
        backgroundColor: colors.base, // Gaya background header
      },
      headerTintColor: '#000', // Warna teks header
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <Image
          source={require('../assets/ibricon.png')} // Path menuju logo gambar
          style={{ width: 50, height: 50, marginLeft: 20, marginRight: -5 }} // Ukuran logo dan jarak ke teks
          resizeMode="contain"
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const db = firebase.firestore();
  
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
  }, []);
  

  const sections = [
    { title: 'Foods', data: foods },
    { title: 'Drinks', data: drinks },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemStock}>Total Stock: {item.quantity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false} // Agar header tidak lengket
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemStock: {
    fontSize: 16,
    color: '#666',
  },
});

export default StockScreen;
