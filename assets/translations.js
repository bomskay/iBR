import { I18n } from 'i18n-js';
import * as Localization from 'react-native-localize';

const i18n = new I18n({
  en: {
    title: 'Ikan Bakar Roong',
    loading: 'Loading orders...',
    orderID: 'Order ID',
    user: 'User',
    unknownUser: 'Unknown User',
    status: 'Status',
    noItems: 'No items in this order.',
    total: 'Total',
    processOrder: 'Process Order',
    completeOrder: 'Complete Order',
    deleteOrder: 'Delete Order',
    orderDeleted: 'Order Deleted',
    deleteSuccess: 'The order has been deleted successfully.',
    deleteError: 'Error deleting order',
    updateError: 'Error updating order status',
  },
  id: {
    title: 'Ikan Bakar Roong',
    loading: 'Memuat pesanan...',
    orderID: 'ID Pesanan',
    user: 'Pengguna',
    unknownUser: 'Pengguna Tidak Dikenal',
    status: 'Status',
    noItems: 'Tidak ada item dalam pesanan ini.',
    total: 'Total',
    processOrder: 'Proses Pesanan',
    completeOrder: 'Selesaikan Pesanan',
    deleteOrder: 'Hapus Pesanan',
    orderDeleted: 'Pesanan Dihapus',
    deleteSuccess: 'Pesanan telah berhasil dihapus.',
    deleteError: 'Gagal menghapus pesanan',
    updateError: 'Gagal memperbarui status pesanan',
  },
});

i18n.locale = Localization.getLocales()[0].languageCode;
i18n.enableFallback = true;

export default i18n;
