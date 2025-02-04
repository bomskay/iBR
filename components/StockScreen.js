import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, Image } from 'react-native';
import { firebase } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import colors from '../assets/colors';

const StockScreen = () => {
  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [tambahan, setTambahan] = useState([]);
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
    const db = firebase.firestore();

    const unsubscribeFoods = db.collection('foods').onSnapshot((snapshot) => {
      const foodItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedFoods = foodItems.sort((a, b) => a.name.localeCompare(b.name));
      setFoods(sortedFoods);
    });

    const unsubscribeDrinks = db.collection('drinks').onSnapshot((snapshot) => {
      const drinkItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedDrinks = drinkItems.sort((a, b) => a.name.localeCompare(b.name));
      setDrinks(sortedDrinks);
    });

    const unsubscribeTambahan = db.collection('tambahan').onSnapshot((snapshot) => {
      const additionItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedTambahan = additionItems.sort((a, b) => a.name.localeCompare(b.name));
      setTambahan(sortedTambahan);
    });

    return () => {
      unsubscribeFoods();
      unsubscribeDrinks();
      unsubscribeTambahan();
    };
  }, []);

  const sections = [
    { title: 'Makanan', data: foods },
    { title: 'Minuman', data: drinks },
    { title: 'Tambahan', data: tambahan },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemStock}>Total Stok: {item.quantity}</Text>
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
        stickySectionHeadersEnabled={false}
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
