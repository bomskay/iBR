// src/components/adminHome/ProductForm.js
import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import colors from '../../../assets/colors';

const ProductForm = ({ form, setForm, handleAddOrUpdate, editId, resetForm }) => {
  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Nama Menu"
        value={form.name}
        onChangeText={(value) => handleChange('name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Deskripsi"
        value={form.description}
        onChangeText={(value) => handleChange('description', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Harga"
        value={form.price}
        onChangeText={(value) => handleChange('price', value)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL"
        value={form.imageUrl}
        onChangeText={(value) => handleChange('imageUrl', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={form.quantity}
        onChangeText={(value) => handleChange('quantity', value)}
        keyboardType="numeric"
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.category}
          onValueChange={(value) => handleChange('category', value)}>
          <Picker.Item label="Makanan" value="food" />
          <Picker.Item label="Minuman" value="drink" />
          <Picker.Item label="Tambahan" value="tambahan" />
        </Picker>
      </View>

      {editId ? (
        <View style={styles.editButtonsRow}>
          <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleAddOrUpdate}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={resetForm}>
            <Text style={styles.buttonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdate}>
          <Text style={styles.buttonText}>Tambah Menu</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: { backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2, marginBottom: 20, },
  input: { height: 45, borderColor: '#D1D5DB', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginVertical: 6, },
  pickerContainer: { borderColor: '#D1D5DB', borderWidth: 1, borderRadius: 8, marginVertical: 6, },
  editButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', flex: 1, },
  updateButton: { backgroundColor: colors.secondary, marginRight: 5, },
  cancelButton: { backgroundColor: '#6B7280', marginLeft: 5, },
  addButton: { backgroundColor: colors.secondary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8, },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', },
});

export default ProductForm;