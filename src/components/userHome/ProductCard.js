import React from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import colors from '../../../assets/colors';

const ProductCard = ({ item, quantity, onQuantityChange, onAddToCart }) => {
  const formatPrice = (price) => `Rp${parseInt(price).toLocaleString('id-ID')}`;

  const increment = () => onQuantityChange(item.id, (quantity || 0) + 1);
  const decrement = () => onQuantityChange(item.id, Math.max(0, (quantity || 0) - 1));

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      
      <View style={styles.quantityRow}>
        <TouchableOpacity style={styles.quantityButton} onPress={decrement}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.quantityInput}
          value={String(quantity || 0)}
          keyboardType="numeric"
          onChangeText={(value) => onQuantityChange(item.id, parseInt(value, 10) || 0)}
        />
        <TouchableOpacity style={styles.quantityButton} onPress={increment}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.addButton} onPress={() => onAddToCart(item)}>
        <Text style={styles.addButtonText}>Tambahkan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, margin: 8, borderRadius: 8, backgroundColor: '#fff', padding: 16, elevation: 2, maxWidth: '48%' },
  image: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  textContainer: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16 },
  description: { fontSize: 14, color: '#6B7280' },
  price: { fontSize: 16, color: '#1F2937', marginVertical: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  quantityButton: { padding: 8, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8 },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  quantityInput: { borderWidth: 1, borderColor: '#D1D5DB', width: 48, textAlign: 'center', marginHorizontal: 8, height: 40 },
  addButton: { backgroundColor: colors.secondary, padding: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});

export default ProductCard;