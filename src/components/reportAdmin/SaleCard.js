// src/components/reportAdmin/SaleCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SaleCard = ({ item, onDelete }) => {
  const formatPrice = (price) => `Rp${parseInt(price).toLocaleString('id-ID')}`;

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.idText}>ID: {item.id}</Text>
        <Text style={styles.totalText}>Total: {formatPrice(item.total)}</Text>
        <Text style={styles.itemsText}>
          {item.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  idText: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  itemsText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444', // bg-red-500
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


export default SaleCard;