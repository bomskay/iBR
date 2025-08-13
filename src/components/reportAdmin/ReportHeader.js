// src/components/reportAdmin/ReportHeader.js (Revised for Single Button)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../../assets/colors';

const ReportHeader = ({ onShowDatePicker, totalSales, startDate, endDate }) => {
  const formatPrice = (price) => `Rp${Math.round(price).toLocaleString('id-ID')}`;
  
  const formatDate = (date) => {
    if (!date) return '...';
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={onShowDatePicker}
      >
        <Text style={styles.datePickerText}>Pilih Rentang Tanggal</Text>
      </TouchableOpacity>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Penjualan</Text>
        {/* Menampilkan rentang tanggal yang dipilih */}
        <Text style={styles.dateLabel}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>
        <Text style={styles.totalAmount}>{formatPrice(totalSales)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  datePickerButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
    marginTop: 4,
  },
});

export default ReportHeader;