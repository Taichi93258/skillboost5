import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Title, Paragraph, TextInput, Button, ActivityIndicator as PaperIndicator } from 'react-native-paper';
import { auth } from '../firebase';
import { updateEmail, sendPasswordResetEmail } from 'firebase/auth';

export default function UserInfoScreen() {
  const user = auth.currentUser;
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateEmail = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateEmail(user, newEmail);
      Alert.alert('更新完了', 'メールアドレスを更新しました');
    } catch (e) {
      Alert.alert('更新失敗', e.message);
    } finally {
      setLoading(false);
    }
  };

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
      <TextInput
        label="メールアドレス"
        value={newEmail}
        onChangeText={setNewEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleUpdateEmail} disabled={loading} style={styles.button}>
        {loading ? <PaperIndicator animating size="small" /> : 'メールアドレスを更新'}
      </Button>
      <Button onPress={handlePasswordReset} style={styles.button}>
        パスワードをリセット
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});