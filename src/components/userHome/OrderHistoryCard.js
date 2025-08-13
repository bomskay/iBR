// src/components/userHome/OrderHistoryCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OrderHistoryCard = ({ item, onCancelOrder }) => {
  const [isCancellable, setIsCancellable] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Hanya jalankan timer jika status 'pending' dan ada batas waktu
    if (item.status !== 'pending' || !item.cancellableUntil) {
      setIsCancellable(false);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const deadline = item.cancellableUntil.toDate();
      const diff = deadline.getTime() - now.getTime();

      if (diff > 0) {
        setIsCancellable(true);
        setTimeLeft(Math.round(diff / 1000));
      } else {
        setIsCancellable(false);
        clearInterval(interval);
      }
    }, 1000);

    // Membersihkan interval saat komponen dilepas
    return () => clearInterval(interval);
  }, [item]);

  return (
    <View style={styles.orderItem}>
      <Text style={styles.orderDetail}>ID: {item.id}</Text>
      <Text style={styles.orderDetail}>
        Status: <Text style={{ fontWeight: 'bold' }}>{item.status}</Text>
      </Text>
      <Text style={styles.orderDetail}>
        Tanggal: {item.createdAt?.toDate().toLocaleString('id-ID')}
      </Text>
      
      {isCancellable && (
        <View style={styles.cancelContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => onCancelOrder(item)}
          >
            <Text style={styles.cancelButtonText}>Batalkan Pesanan</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>
            Sisa waktu: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orderItem: { 
    padding: 16, 
    backgroundColor: '#ffffff', 
    borderRadius: 8, 
    marginBottom: 12, 
    elevation: 1 
  },
  orderDetail: { 
    fontSize: 14, 
    color: '#4B5563' 
  },
  cancelContainer: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  cancelButton: { 
    backgroundColor: '#EF4444', 
    padding: 12, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  cancelButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  timerText: { 
    textAlign: 'center', 
    marginTop: 8, 
    color: '#6B7280', 
    fontSize: 12 
  },
});

export default OrderHistoryCard;
