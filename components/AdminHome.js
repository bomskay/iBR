import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Button, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../firebaseConfig';
import colors from '../assets/colors';

const AdminHome = () => {
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', quantity: '1', category: 'foods' });
  const [items, setItems] = useState([]); // Combined items
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const db = firebase.firestore();
  const navigation = useNavigation();

  const defaultImageUrl = 'https://via.placeholder.com/150';

  useEffect(() => {
    navigation.setOptions({
      title: 'Ikan Bakar Roong',
      headerStyle: {
        backgroundColor: colors.base,
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <Image
          source={require('../assets/ibricon.png')}
          style={{ width: 50, height: 50, marginLeft: 20, marginRight: -5 }}
          resizeMode="contain"
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribeFoods = db.collection('foods').onSnapshot((snapshot) => {
      const foodItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), category: 'foods' }));
      const sortedFoods = foodItems.sort((a, b) => a.name.localeCompare(b.name)); // Sortir makanan
      setItems(prevItems => [...sortedFoods, ...prevItems.filter(item => item.category === 'drinks' || item.category === 'tambahan')]);
    });
  
    const unsubscribeDrinks = db.collection('drinks').onSnapshot((snapshot) => {
      const drinkItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), category: 'drinks' }));
      const sortedDrinks = drinkItems.sort((a, b) => a.name.localeCompare(b.name)); // Sortir minuman
      setItems(prevItems => [...prevItems.filter(item => item.category === 'foods' || item.category === 'tambahan'), ...sortedDrinks]);
    });

    const unsubscribeTambahan = db.collection('tambahan').onSnapshot((snapshot) => {
      const tambahanItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), category: 'tambahan' }));
      const sortedTambahan = tambahanItems.sort((a, b) => a.name.localeCompare(b.name)); // Sortir tambahan
      setItems(prevItems => [...prevItems.filter(item => item.category === 'foods' || item.category === 'drinks'), ...sortedTambahan]);
    });
  
    return () => {
      unsubscribeFoods();
      unsubscribeDrinks();
      unsubscribeTambahan();
    };
  }, [db]);
  

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const formatPrice = (price) => {
    return price ? `Rp.${parseInt(price).toLocaleString('id-ID')}` : 'Rp.0';
  };

  // CRUD
  const handleAddOrUpdate = () => {
    const itemData = {
      ...form,
      imageUrl: form.imageUrl || defaultImageUrl,
      quantity: parseInt(form.quantity) || 1,
    };

    const collection = form.category === 'drinks' ? 'drinks' : form.category === 'tambahan' ? 'tambahan' : 'foods';

    if (editId) {
      db.collection(collection).doc(editId).update(itemData)
        .then(() => resetForm())
        .catch(console.error);
    } else {
      db.collection(collection).add(itemData)
        .then((docRef) => {
          alert(`Menu berhasil ditambahkan dengan ID: ${docRef.id}`);
          resetForm();
        })
        .catch(console.error);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id, category) => {
    const collection = category === 'drinks' ? 'drinks' : category === 'tambahan' ? 'tambahan' : 'foods';
    db.collection(collection).doc(id).delete().catch(console.error);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', imageUrl: '', quantity: '1', category: 'foods' });
    setEditId(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.imageUrl || defaultImageUrl }} 
        style={styles.image} 
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.category)}>
            <Text style={styles.deleteButton}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const groupedItems = items.reduce((acc, item) => {
    const group = acc.find(g => g.title === (item.category === 'foods' ? 'Makanan' : item.category === 'drinks' ? 'Minuman' : 'Tambahan'));
    if (group) {
      group.data.push(item);
    } else {
      acc.push({
        title: item.category === 'foods' ? 'Makanan' : item.category === 'drinks' ? 'Minuman' : 'Tambahan',
        data: [item]
      });
    }
    return acc;
  }, []);
  
  groupedItems.sort((a, b) => {
    const order = ['Makanan', 'Minuman', 'Tambahan'];
    return order.indexOf(a.title) - order.indexOf(b.title);
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsFormVisible(!isFormVisible)}>
        <Text style={styles.toggleButton}>{isFormVisible ? 'Minimize' : 'Expand'}</Text>
      </TouchableOpacity>

      {isFormVisible && (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Nama"
            value={form.name}
            onChangeText={(value) => handleChange('name', value)}
            style={styles.smallInput}
          />
          <TextInput
            placeholder="Deskripsi"
            value={form.description}
            onChangeText={(value) => handleChange('description', value)}
            style={styles.smallInput}
          />
          <TextInput
            placeholder="Harga"
            value={form.price}
            onChangeText={(value) => handleChange('price', value)}
            keyboardType="numeric"
            style={styles.smallInput}
          />
          <TextInput
            placeholder="Image URL"
            value={form.imageUrl}
            onChangeText={(value) => handleChange('imageUrl', value)}
            style={styles.smallInput}
          />
          <TextInput
            placeholder="Quantity"
            value={form.quantity}
            onChangeText={(value) => handleChange('quantity', value)}
            keyboardType="numeric"
            style={styles.smallInput}
          />

          <Picker
            selectedValue={form.category}
            style={styles.smallPicker}
            onValueChange={(value) => handleChange('category', value)}>
            <Picker.Item label="Makanan" value="foods" />
            <Picker.Item label="Minuman" value="drinks" />
            <Picker.Item label="Tambahan" value="tambahan" />
          </Picker>

          {editId ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleAddOrUpdate}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: 'gray' }]} onPress={resetForm}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdate}>
              <Text style={styles.addbuttonText}>Tambah Menu</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={groupedItems}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <FlatList
            data={item.data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={() => renderSectionHeader({ section: { title: item.title } })}
          />
        )}
        nestedScrollEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#f9f9f9',
  },
  toggleButton: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: 20, 
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  smallInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  smallPicker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addbuttonText: {
    color: '#fff',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
    flexDirection: 'row',
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
    marginVertical: 5,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  buttonText:{
    color:'white',
  },
  editButton: {
    color: colors.secondary,
  },
  deleteButton: {
    color: 'red',
  },
});

export default AdminHome;
