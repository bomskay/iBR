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

        // simpan info pengguna ke firestore 
        await firebase.firestore().collection('users').doc(user.uid).set({
          userId: user.uid,  // simpan userId
          name: name,        // simpan nama pengguna
          email: user.email, // simpan email
          isAdmin: false,    // jenis akun, boleh diatur jadi admin jika yang daftar adalah admin
          createdAt: firebase.firestore.FieldValue.serverTimestamp() // waktu pendaftaran
        });

        navigation.navigate('UserHome'); // pindah ke UserHome setelah pendaftaran
      })
      .catch(error => setErrorMessage(error.message));
  };

  // fungsi for hapus pesan kesalahan saat pengguna mulai mengetik
  const clearErrorMessage = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/ibricon.png')} // ikon logo
        style={styles.icon}
      />
      <TextInput
        placeholder="Nama Pengguna"  // input untuk nama pengguna
        value={name}
        onChangeText={setName}
        onFocus={clearErrorMessage}
        style={styles.input}
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
      <TextInput
        placeholder="Konfirmasi Kata Sandi"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onFocus={clearErrorMessage}
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
    marginBottom: 10,
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
});

export default SignUpScreen;
