// src/screens/SalesReportScreen.js
import React from 'react'; // <-- PERBAIKAN DI SINI
import {
  View,
  Text,
  FlatList,
  Alert,
  SafeAreaView,
  StyleSheet,
  Platform,StatusBar
} from 'react-native';
import { firebase } from '../../../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import SaleCard from '../../components/reportAdmin/SaleCard';
import ReportHeader from '../../components/reportAdmin/ReportHeader';

const SalesReportScreen = () => {
  const [sales, setSales] = React.useState([]);
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());
  const [isPickerVisible, setPickerVisible] = React.useState(false);
  const [pickerTarget, setPickerTarget] = React.useState('start');
  const [totalSales, setTotalSales] = React.useState(0);
  const db = firebase.firestore();

  React.useEffect(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const unsubscribe = db.collection('sales')
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const salesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSales(salesData);
        const total = salesData.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        setTotalSales(total);
      });

    return () => unsubscribe();
  }, [startDate, endDate]);

  const handleShowDatePicker = () => {
    setPickerTarget('start');
    setPickerVisible(true);
  };
  
  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
    }

    if (event.type === 'set' && selectedDate) {
      if (pickerTarget === 'start') {
        setStartDate(selectedDate);
        setPickerTarget('end');
        if (Platform.OS === 'android') {
          setPickerVisible(true);
        }
      } else if (pickerTarget === 'end') {
        if (selectedDate < startDate) {
            Alert.alert("Tanggal Tidak Valid", "Tanggal akhir tidak boleh sebelum tanggal mulai.");
            setEndDate(startDate);
        } else {
            setEndDate(selectedDate);
        }
        if (Platform.OS === 'ios') {
          setPickerVisible(false);
        }
        setPickerTarget('start');
      }
    } else {
      setPickerVisible(false);
    }
  };
  
  const deleteSale = (saleToDelete) => {
    if (!saleToDelete || !saleToDelete.items) {
      Alert.alert('Error', 'Data penjualan tidak valid.');
      return;
    }
    
    Alert.alert(
      'Hapus Penjualan',
      'Menghapus data ini juga akan mengembalikan stok barang. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus & Kembalikan Stok',
          onPress: async () => {
            const batch = db.batch();
            try {
              saleToDelete.items.forEach(item => {
                const productRef = db.collection('products').doc(item.id);
                batch.update(productRef, {
                  quantity: firebase.firestore.FieldValue.increment(item.quantity)
                });
              });
              const saleRef = db.collection('sales').doc(saleToDelete.id);
              batch.delete(saleRef);
              await batch.commit();
              Alert.alert('Sukses', 'Data penjualan telah dihapus dan stok telah dikembalikan.');
            } catch (error) {
              console.error('Error menghapus penjualan: ', error);
              Alert.alert('Error', 'Gagal memproses penghapusan.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ReportHeader
          onShowDatePicker={handleShowDatePicker}
          totalSales={totalSales}
          startDate={startDate}
          endDate={endDate}
        />

        {isPickerVisible && (
          <DateTimePicker
            value={pickerTarget === 'start' ? startDate : endDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        
        <View style={styles.listContainer}>
            <FlatList
                data={sales}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SaleCard item={item} onDelete={() => deleteSale(item)} />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada data penjualan untuk periode ini.</Text>}
                showsVerticalScrollIndicator={false}
            />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F9FAFB', },
  container: { flex: 1, padding: 16 },
  listContainer: { flex: 1, marginTop: 16 },
  emptyText: { textAlign: 'center',color: '#6B7280',marginTop: 40, fontSize: 16 }
});

export default SalesReportScreen;