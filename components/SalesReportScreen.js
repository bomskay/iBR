import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { firebase } from '../firebaseConfig';
import colors from '../assets/colors';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const SalesReportScreen = () => {
  const [sales, setSales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [totalSales, setTotalSales] = useState(0); // Total penjualan per hari
  const db = firebase.firestore();
  const navigation = useNavigation();

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
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0); // Awal hari (00:00:00)
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999); // Akhir hari (23:59:59)

    const unsubscribeSales = db
      .collection('sales')
      .where('timestamp', '>=', startOfDay)
      .where('timestamp', '<=', endOfDay)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const salesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSales(salesData);

        // Menghitung total penjualan untuk hari tersebut
        const total = salesData.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        setTotalSales(total);
      });

    return () => {
      unsubscribeSales();
    };
  }, [db, selectedDate]);

  const formatPrice = (price) => {
    return price ? `Rp.${parseInt(price).toLocaleString('id-ID')}` : 'Rp.0';
  };

  const deleteSale = (saleId) => {
    Alert.alert(
      'Hapus Penjualan',
      'Apakah Anda yakin ingin menghapus data penjualan ini?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          onPress: () => {
            db.collection('sales')
              .doc(saleId)
              .delete()
              .then(() => {
                console.log('Penjualan berhasil dihapus');
              })
              .catch((error) => {
                console.error('Error menghapus penjualan: ', error);
              });
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.totalText}>Total: {formatPrice(item.total)}</Text>
        <Text style={styles.itemList}>
          {item.items.map((i, index) => `${i.name} x${i.quantity}${index < item.items.length - 1 ? ', ' : ''}`)}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteSale(item.id)}
      >
        <Text style={styles.deleteButtonText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerText}>Pilih Tanggal</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
      />

      {sales.length === 0 && (
        <Text style={styles.noDataText}>Tidak ada data penjualan untuk tanggal ini.</Text>
      )}

      <View style={styles.totalSalesContainer}>
        <Text style={styles.totalSalesText}>Total Penjualan Hari Ini: {formatPrice(totalSales)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  list: {
    marginTop: 10,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  textContainer: {
    justifyContent: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight:'bold',
    color: 'black',
  },
  itemList: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: colors.base,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  totalSalesContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 20,
    elevation: 2,
  },
  totalSalesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  datePickerButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  datePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default SalesReportScreen;
