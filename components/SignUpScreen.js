import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../firebaseConfig';
import colors from '../assets/colors';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState(''); // Tambahkan input untuk nama pengguna
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setErrorMessage("Kata sandi tidak cocok!");
      return;
    }
    if (!email || !password || !name) {
      setErrorMessage("Semua bidang harus diisi!");
      return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Menyimpan informasi pengguna ke Firestore
        await firebase.firestore().collection('users').doc(user.uid).set({
          userId: user.uid,  // Menyimpan userId
          name: name,        // Menyimpan nama pengguna
          email: user.email,
          isAdmin: false,    // Atur ini ke true jika ini adalah akun admin
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        navigation.navigate('UserHome'); // Arahkan ke UserHome setelah pendaftaran
      })
      .catch(error => setErrorMessage(error.message));
  };

  // Fungsi untuk menghapus pesan kesalahan saat pengguna mulai mengetik
  const clearErrorMessage = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tambahkan ikon di atas input */}
      <Image
        source={require('../assets/ibricon.png')} // Ganti dengan nama file ikon Anda
        style={styles.icon}
      />
      <TextInput
        placeholder="Nama Pengguna"  // Input untuk nama pengguna
        value={name}
        onChangeText={setName}
        onFocus={clearErrorMessage} // Menghapus pesan kesalahan saat fokus
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        onFocus={clearErrorMessage} // Menghapus pesan kesalahan saat fokus
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Kata Sandi"
        value={password}
        onChangeText={setPassword}
        onFocus={clearErrorMessage} // Menghapus pesan kesalahan saat fokus
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        placeholder="Konfirmasi Kata Sandi"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onFocus={clearErrorMessage} // Menghapus pesan kesalahan saat fokus
        style={styles.input}
        secureTextEntry
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Daftar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Pusatkan konten secara horizontal
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    width: 150, // Sesuaikan ukuran ikon
    height: 150, // Sesuaikan ukuran ikon
    marginBottom: 30, // Tambahkan jarak di bawah ikon
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
    width: '100%', // Buat input mengambil lebar penuh
  },
  button: {
    width: '100%', // Mengatur lebar tombol
    height: 50, // Tinggi tombol
    backgroundColor: colors.secondary, // Warna latar belakang tombol
    justifyContent: 'center', // Pusatkan teks secara vertikal
    alignItems: 'center', // Pusatkan teks secara horizontal
    borderRadius: 5, // Sudut membulat
    marginBottom: 15, // Jarak di bawah tombol
  },
  buttonText: {
    color: '#ffffff', // Warna teks tombol
    fontSize: 16, // Ukuran font
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignUpScreen;
