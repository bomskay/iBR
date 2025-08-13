// src/components/authen/SignUpForm.js
import React from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../../../assets/colors';

const SignUpForm = ({
  name, setName,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  errorMessage,
  loading,
  handleSignUp,
  clearErrorMessage
}) => {
  return (
    <View style={styles.formContainer}>
      <Image
        source={require('../../../assets/ibricon.png')} // Sesuaikan path ke aset Anda
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Nama Pengguna"
        value={name}
        onChangeText={setName}
        onFocus={clearErrorMessage}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        onFocus={clearErrorMessage}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Kata Sandi"
        value={password}
        onChangeText={setPassword}
        onFocus={clearErrorMessage}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Konfirmasi Kata Sandi"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onFocus={clearErrorMessage}
        secureTextEntry
      />

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Daftar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.secondary, // Warna biru
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444', // Warna merah
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SignUpForm;