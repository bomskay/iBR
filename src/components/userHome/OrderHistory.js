import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const OrderHistory = ({ orders }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riwayat Pesanan Anda:</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Anda belum memiliki pesanan.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <Text style={styles.orderDetail}>ID: {item.id}</Text>
              <Text style={styles.orderDetail}>
                Status: <Text style={{ fontWeight: 'bold' }}>{item.status}</Text>
              </Text>
              <Text style={styles.orderDetail}>
                Tanggal: {item.createdAt?.toDate().toLocaleString('id-ID')}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
  emptyText: { fontSize: 16, color: '#6B7280' },
  orderItem: { padding: 16, backgroundColor: '#ffffff', borderRadius: 8, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  orderDetail: { fontSize: 14, color: '#4B5563' },
});

export default OrderHistory;