// src/components/adminDashboard/DashboardCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardCard = ({ title, value, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    flex: 1,
    margin: 8,
    elevation: 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#6B7280',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1F2937',
  },
});

export default DashboardCard;