import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Title, Paragraph, TextInput, Button, ActivityIndicator as PaperIndicator, Portal, Modal } from 'react-native-paper';
import { auth, actionCodeSettings } from '../firebase';
import { verifyBeforeUpdateEmail, sendPasswordResetEmail } from 'firebase/auth';

export default function UserInfoScreen() {
  const user = auth.currentUser;
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const handleUpdateEmail = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      Alert.alert(
        '確認メール送信',
        '新しいメールアドレスに検証用リンクを送信しました。メールを開いてリンクをクリックしてください。'
      );
    } catch (e) {
      Alert.alert('送信失敗', e.message);
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
      <Paragraph>メールアドレス: {user.email || ''}</Paragraph>
      <Button mode="contained" onPress={() => setIsEditingEmail(true)} style={styles.button}>
        メールアドレスを更新
      </Button>
      <Portal>
        <Modal
          visible={isEditingEmail}
          onDismiss={() => setIsEditingEmail(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <TextInput
            label="現在のメールアドレス"
            value={user.email || ''}
            disabled
            style={styles.input}
          />
          <TextInput
            label="新しいメールアドレス"
            value={newEmail}
            onChangeText={setNewEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button onPress={() => setIsEditingEmail(false)}>
              キャンセル
            </Button>
            <Button
              mode="contained"
              onPress={async () => {
                await handleUpdateEmail();
                setIsEditingEmail(false);
              }}
              disabled={loading}
              style={styles.modalUpdateButton}
            >
              {loading ? <PaperIndicator animating size="small" /> : '更新'}
            </Button>
          </View>
        </Modal>
      </Portal>
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
  modalContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  modalUpdateButton: { marginLeft: 8 },
});