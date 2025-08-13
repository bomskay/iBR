// src/components/userHome/UserInfoCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const UserInfoCard = ({ userInfo, userIconUri, onIconChange }) => {
  if (!userInfo) return null;

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onIconChange}>
        <Image
          source={{ uri: userIconUri }}
          style={styles.userIcon}
        />
      </TouchableOpacity>
      <View style={styles.infoTextContainer}>
        <Text style={styles.label}>Nama Pengguna:</Text>
        <Text style={styles.value}>{userInfo.name}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userInfo.email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center', marginBottom: 20, padding: 20, backgroundColor: '#ffffff', borderRadius: 20, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  userIcon: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  infoTextContainer: { alignItems: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  value: { fontSize: 16, color: '#4B5563', marginBottom: 12 },
});

export default UserInfoCard;