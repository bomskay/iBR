import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../firebaseConfig';
import colors from '../assets/colors';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSignIn = () => {
    if (!email || !password) {
      setErrorMessage('Email dan kata sandi tidak boleh kosong.');
      return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Mengambil data pengguna dari Firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.isAdmin) {
            navigation.navigate('AdminHome'); // Arahkan ke AdminHome jika admin
          } else {
            navigation.navigate('UserHome'); // Arahkan ke UserHome jika bukan admin
          }
        }
      })
      .catch(error => {
        if (error.code === 'auth/wrong-password') {
          setErrorMessage('Kata sandi salah. Silakan coba lagi.');
        } else if (error.code === 'auth/user-not-found') {
          setErrorMessage('Pengguna tidak ditemukan. Silakan daftar jika belum memiliki akun.');
        } else {
          setErrorMessage('Email atau password salah. Silakan coba lagi.');
        }
      });
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
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Masuk</Text>
      </TouchableOpacity>
      
      {/* Tombol untuk navigasi ke Sign Up */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>Belum punya akun? Daftar di sini!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Pusatkan konten secara vertikal
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
    marginBottom: 15, // Tambahkan jarak lebih besar di bawah input
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
  signupText: {
    marginTop: 15,
    color: 'black',
    textAlign: 'center',
  },
});

export default SignInScreen;
