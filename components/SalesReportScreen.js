import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.totalText}>Total: {formatPrice(item.total)}</Text>
        <Text style={styles.itemList}>
          {item.items.map((i, index) => `${i.name} x${i.quantity}${index < item.items.length - 1 ? ', ' : ''}`)}
        </Text>
      </View>
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
    justifyContent: 'space-between',  // Membuat konten mengisi ruang dengan baik
  },
  list: {
    marginTop: 10,
    flexGrow: 1,  // Agar FlatList mengisi ruang yang ada
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  textContainer: {
    justifyContent: 'center',
  },
  totalText: {
    fontSize: 14,
    color: colors.secondary,
  },
  itemList: {
    fontSize: 14,
    color: '#666',
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
