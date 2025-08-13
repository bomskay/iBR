// src/components/authen/SignInForm.js
import React from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../../../assets/colors';

const SignInForm = ({
  email, setEmail,
  password, setPassword,
  loading,
  errorMessage,
  handleSignIn,
  clearErrorMessage,
  onNavigateToSignUp
}) => {
  return (
    <View style={styles.formContainer}>
      <Image
        source={require('../../../assets/ibricon.png')} 
        style={styles.icon}
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

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Masuk</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.signupContainer} onPress={onNavigateToSignUp}>
        <Text style={styles.signupText}>Belum punya akun? <Text style={styles.signupLink}>Daftar di sini!</Text></Text>
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
    backgroundColor: colors.secondary,
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
    color: '#EF4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  signupContainer: {
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#374151',
  },
  signupLink: {
    fontWeight: 'bold',
    color: colors.secondary,
  },
});

export default SignInForm;