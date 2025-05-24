import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  Card,
  Title,
  Paragraph,
  Button as PaperButton,
  ActivityIndicator as PaperIndicator,
  TextInput,
} from 'react-native-paper';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const headerHeight = useHeaderHeight();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('送信失敗', 'メールアドレスを入力してください');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('送信完了', 'パスワードリセット用のメールを送信しました');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      const errorMessage = (() => {
        switch (e.code) {
          case 'auth/invalid-email':
            return '有効なメールアドレスを入力してください';
          case 'auth/user-not-found':
            return '指定されたメールアドレスのユーザーは存在しません';
          default:
            return '送信に失敗しました';
        }
      })();
      Alert.alert('エラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
          <View style={styles.container}>
            <PaperIndicator animating size="large" />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
        <Animatable.View
          animation="fadeInDown"
          style={[styles.container, { transform: [{ translateY: -headerHeight / 2 }] }]}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>パスワードを忘れた場合</Title>
              <Paragraph style={styles.subtitle}>
                登録済みのメールアドレスを入力してください。
              </Paragraph>
              <TextInput
                label="メールアドレス"
                value={email}
                onChangeText={setEmail}
                style={{ marginBottom: 8 }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Card.Content>
            <Card.Actions>
              <PaperButton onPress={() => navigation.goBack()}>戻る</PaperButton>
              <PaperButton mode="contained" onPress={handlePasswordReset} style={styles.button}>
                送信
              </PaperButton>
            </Card.Actions>
          </Card>
        </Animatable.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradientBackground: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16 },
  card: { width: '100%', maxWidth: 400 },
  button: { marginLeft: 'auto' },
});