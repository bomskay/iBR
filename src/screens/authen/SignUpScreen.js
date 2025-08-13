import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { firebase } from '../../../firebaseConfig';
import SignUpForm from '../../components/authen/SignUpForm';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setErrorMessage("Kata sandi tidak cocok!");
      return;
    }
    if (!email || !password || !name) {
      setErrorMessage("Semua bidang harus diisi!");
      return;
    }

    setLoading(true);
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await firebase.firestore().collection('users').doc(user.uid).set({
          name: name,
          email: user.email,
          isAdmin: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        navigation.navigate('UserHome');
      })
      .catch(error => {
        let friendlyMessage = "Terjadi kesalahan. Silakan coba lagi.";
        switch (error.code) {
          case 'auth/email-already-in-use':
            friendlyMessage = "Alamat email ini sudah terdaftar.";
            break;
          case 'auth/invalid-email':
            friendlyMessage = "Format alamat email tidak valid.";
            break;
          case 'auth/weak-password':
            friendlyMessage = "Kata sandi terlalu lemah (minimal 6 karakter).";
            break;
        }
        setErrorMessage(friendlyMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const clearErrorMessage = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SignUpForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          errorMessage={errorMessage}
          loading={loading}
          handleSignUp={handleSignUp}
          clearErrorMessage={clearErrorMessage}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default SignUpScreen;