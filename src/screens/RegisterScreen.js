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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function RegisterScreen({ navigation }) {
  const headerHeight = useHeaderHeight();
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!nickname) {
      Alert.alert('登録失敗', 'ニックネームを入力してください');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: nickname });
      navigation.replace('Categories');
    } catch (e) {
      console.error(e);
      Alert.alert('登録失敗', e.message);
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
            <Title style={styles.title}>新規登録</Title>
            <Paragraph style={styles.subtitle}>ニックネーム、メールアドレス、パスワードを登録してください。</Paragraph>
            <TextInput
              label="ニックネーム"
              value={nickname}
              onChangeText={setNickname}
              style={{ marginBottom: 8 }}
            />
            <TextInput
              label="メールアドレス"
              value={email}
              onChangeText={setEmail}
              style={{ marginBottom: 8 }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              label="パスワード"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{ marginBottom: 8 }}
            />
          </Card.Content>
          <Card.Actions>
            <PaperButton onPress={() => navigation.goBack()}>戻る</PaperButton>
            <PaperButton mode="contained" onPress={handleRegister} style={styles.button}>
              登録
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