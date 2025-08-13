import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OrderCard = ({ item, onUpdateStatus, onDeleteOrder }) => {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (item.status !== 'pending' || !item.cancellableUntil) {
      setIsLocked(true);
      return;
    }
    const interval = setInterval(() => {
      const now = new Date();
      const deadline = item.cancellableUntil.toDate();
      if (now > deadline) {
        setIsLocked(true);
        clearInterval(interval);
      } else {
        setIsLocked(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const formatPrice = (price) => `Rp${parseInt(price).toLocaleString('id-ID')}`;
  
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Jam tidak tersedia';
    return timestamp.toDate().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const total = item.items?.reduce((sum, current) => sum + current.price * current.quantity, 0) || 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.detailText}>Pemesan: <Text style={styles.boldText}>{item.userName || "Unknown"}</Text></Text>
        <Text style={styles.timeText}>Jam: {formatTime(item.createdAt)}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.detailText}>Status: <Text style={styles.boldText}>{item.status}</Text></Text>
        {item.status === 'pending' && (
          isLocked ? (
            <Text style={styles.lockedText}>Pesanan Terkunci</Text>
          ) : (
            <Text style={styles.cancellableText}>Bisa Dibatalkan</Text>
          )
        )}
      </View>
      
      <View style={styles.itemsContainer}>
        {item.items?.map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            - {orderItem.name} x {orderItem.quantity}
          </Text>
        ))}
      </View>
      
      <Text style={styles.totalText}>Total: {formatPrice(total)}</Text>
      
      <View style={styles.buttonRow}>
        {item.status === 'pending' && (
          <TouchableOpacity 
            onPress={() => onUpdateStatus(item.id, 'Diproses', item)} 
            style={[styles.button, styles.processButton]}
          >
            <Text style={styles.buttonText}>Proses</Text>
          </TouchableOpacity>
        )}
        {item.status === 'Diproses' && (
          <TouchableOpacity 
            onPress={() => onUpdateStatus(item.id, 'Selesai', item)} 
            style={[styles.button, styles.completeButton]}
          >
            <Text style={styles.buttonText}>Selesai</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={() => onDeleteOrder(item.id, item.items)} 
          style={[styles.button, styles.deleteButton]}
        >
          <Text style={styles.buttonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2, },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, },
  lockedText: { fontSize: 12, fontWeight: 'bold', color: '#10B981' },
  cancellableText: { fontSize: 12, fontStyle: 'italic', color: '#F59E0B' },
  timeText: { fontSize: 14, color: '#374151', fontWeight: 'bold', },
  detailText: { fontSize: 14, color: '#374151', },
  boldText: { fontWeight: 'bold', },
  itemsContainer: { marginVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingVertical: 8, },
  itemText: { fontSize: 14, color: '#4B5563', },
  totalText: { fontSize: 16, fontWeight: 'bold', textAlign: 'right', },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginLeft: 8, },
  buttonText: { color: 'white', fontWeight: 'bold', },
  processButton: { backgroundColor: '#F59E0B', },
  completeButton: { backgroundColor: '#10B981', },
  deleteButton: { backgroundColor: '#EF4444', }
});

export default OrderCard;
