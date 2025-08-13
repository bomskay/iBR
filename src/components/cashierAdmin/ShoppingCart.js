// src/components/cashierAdmin/ShoppingCart.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../../assets/colors';

const ShoppingCart = ({ cart, onUpdateQuantity, onRemoveFromCart, total, onCheckout }) => {
  const formatPrice = (price) => `Rp${parseInt(price).toLocaleString('id-ID')}`;

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity onPress={() => onUpdateQuantity(item.id, -1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(item.id, 1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => onRemoveFromCart(item.id)} style={styles.removeButtonContainer}>
        <Text style={styles.removeButtonText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        ListHeaderComponent={<Text style={styles.header}>Keranjang</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Keranjang kosong</Text>}
        style={styles.list}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.checkoutButton}
        onPress={onCheckout}
      >
        <Text style={styles.checkoutButtonText}>Bayar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderTopWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    list: {
        maxHeight: 200,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 6,
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 12,
        color: '#6B7280',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        padding: 4,
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: 16,
        marginHorizontal: 12,
    },
    removeButtonContainer: {
        marginLeft: 16,
    },
    removeButtonText: {
        color: '#EF4444',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    checkoutButton: {
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    checkoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default ShoppingCart;