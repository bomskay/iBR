// src/components/cashierAdmin/MenuList.js
import React from 'react';
import { View, Text, SectionList, Image, TouchableOpacity, StyleSheet } from 'react-native';

const MenuList = ({ sections, onAddToCart }) => {
  const formatPrice = (price) => `Rp${parseInt(price).toLocaleString('id-ID')}`;

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => onAddToCart(item)}
      style={styles.card}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    marginVertical: 4,
    borderRadius: 6,
    elevation: 1,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    color: 'black',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
});

export default MenuList;