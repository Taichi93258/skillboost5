import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function UserInfoScreen() {
  const user = auth.currentUser;

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('送信完了', 'パスワードリセット用のメールを送信しました');
    } catch (e) {
      Alert.alert('エラー', e.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Title>ユーザー情報</Title>
      <Paragraph>ニックネーム: {user.displayName || ''}</Paragraph>
      <Paragraph>メールアドレス: {user.email || ''}</Paragraph>
      <Button onPress={handlePasswordReset} style={styles.button}>
        パスワードをリセット
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  button: { marginTop: 8 },
});