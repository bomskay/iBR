// src/components/stockAdmin/StockList.js (Revised)
import React from 'react';
import { View, Text, SectionList, StyleSheet, TextInput } from 'react-native';

const StockList = ({ sections, onStockUpdate }) => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <TextInput
        style={styles.stockInput}
        defaultValue={String(item.quantity || 0)} // <-- Menampilkan stok saat ini
        keyboardType="numeric"
        // Memanggil fungsi update saat selesai mengedit
        onEndEditing={(e) => {
          const newQuantity = e.nativeEvent.text;
          onStockUpdate(item.id, newQuantity);
        }}
      />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // <-- Menambahkan ini agar sejajar
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1, // <-- Agar nama item tidak terpotong
  },
  stockInput: { // <-- Style baru untuk input stok
    fontSize: 16,
    color: '#1F2937', // text-gray-800
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
    borderRadius: 8,
    width: 80, // Lebar input
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default StockList;