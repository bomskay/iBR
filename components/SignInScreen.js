import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native'; // Import ActivityIndicator
import { firebase } from '../firebaseConfig';
import colors from '../assets/colors';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false); // State untuk loading

  const handleSignIn = () => {
    if (!email || !password) {
      setErrorMessage('Email dan kata sandi tidak boleh kosong.');
      return;
    }

    setLoading(true); //loading indicator saat proses login dimulai

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // ambil data pengguna dari firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.isAdmin) {
            navigation.navigate('AdminHome'); // arahkan ke AdminHome jika admin
          } else {
            navigation.navigate('UserHome'); // arahkan ke UserHome jika bukan admin
          }
        } else {
          setErrorMessage('Data pengguna tidak ditemukan.');
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
      })
      .finally(() => {
        setLoading(false); // nonaktifkan loading indicator setelah proses selesai
      });
  };

  // fungsi untuk menghapus pesan kesalahan saat pengguna mulai mengetik
  const clearErrorMessage = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/ibricon.png')} 
        style={styles.icon}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        onFocus={clearErrorMessage} 
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Kata Sandi"
        value={password}
        onChangeText={setPassword}
        onFocus={clearErrorMessage} 
        style={styles.input}
        secureTextEntry
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {/* Menambahkan loading indicator */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>
      )}

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
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    width: 150, 
    height: 150, 
    marginBottom: 30, 
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15, 
    backgroundColor: '#f7f7f7',
    width: '100%', 
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.secondary,
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
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
  loader: {
    marginVertical: 20,
  },
});

export default SignInScreen;
  