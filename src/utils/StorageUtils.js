// src/utils/StorageUtils.js
import { firebase } from '../../firebaseConfig';

/**
 * Mengunggah gambar ke Firebase Storage dan mengembalikan URL publiknya.
 * @param {string} uri - URI lokal dari gambar yang dipilih.
 * @returns {Promise<string|null>} URL unduhan publik atau null jika gagal.
 */
export const uploadImageAsync = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const ref = firebase.storage().ref().child(`images/${Date.now()}-${filename}`);

    await ref.put(blob);
    const url = await ref.getDownloadURL();
    return url;
  } catch (e) {
    console.error("Error uploading image:", e);
    return null;
  }
};