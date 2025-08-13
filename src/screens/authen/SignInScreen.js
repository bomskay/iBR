import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { firebase } from '../../../firebaseConfig';
import SignInForm from '../../components/authen/SignInForm';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    if (!email || !password) {
      setErrorMessage('Email dan kata sandi tidak boleh kosong.');
      return;
    }

    setLoading(true);
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const userDoc = await firebase.firestore().collection('users').doc(userCredential.user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.isAdmin) {
            navigation.replace('AdminHome');
          } else {
            navigation.navigate('UserHome');
          }
        } else {
          setErrorMessage('Data pengguna tidak ditemukan.');
        }
      })
      .catch(error => {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setErrorMessage('Email atau kata sandi salah.');
        } else {
          setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
        }
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
        <SignInForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          errorMessage={errorMessage}
          handleSignIn={handleSignIn}
          clearErrorMessage={clearErrorMessage}
          onNavigateToSignUp={() => navigation.navigate('SignUp')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default SignInScreen;