import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import colors from '../../../assets/colors';

const CartModal = ({ isVisible, onClose, cart, onRemoveFromCart, onPlaceOrder, totalPrice }) => {
  const formatPrice = (price) => `Rp${parseInt(price).toLocaleString('id-ID')}`;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Keranjang Anda</Text>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.itemName}>{item.name} x {item.quantity}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                <TouchableOpacity onPress={() => onRemoveFromCart(item.id)}>
                  <Text style={styles.removeButton}>Hapus</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Keranjang kosong</Text>}
          />
          <Text style={styles.totalPrice}>Total: {formatPrice(totalPrice)}</Text>
          <View style={styles.noteContainer}>
    <Text style={styles.noteText}>
        Estimasi waktu penyiapan pesanan adalah 30-40 menit setelah pesanan dibuat.
    </Text>
</View>
          <TouchableOpacity style={styles.orderButton} onPress={onPlaceOrder}>
            <Text style={styles.buttonText}>Buat Pesanan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    marginHorizontal: 16,
  },
  removeButton: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginVertical: 16,
  },
  orderButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#6B7280',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noteContainer: {
        backgroundColor: '#FEF3C7', 
        padding: 10,
        borderRadius: 6,
        marginVertical: 16,
    },
    noteText: {
        textAlign: 'center',
        color: '#92400E', 
        fontSize: 13,
    }
});

export default CartModal;