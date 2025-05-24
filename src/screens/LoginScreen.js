import React, { useState, useCallback } from 'react';
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
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

export default function LoginScreen({ navigation }) {
  const headerHeight = useHeaderHeight();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          navigation.replace('Categories');
        } else {
          setLoading(false);
        }
      });
      return unsubscribe;
    }, [navigation])
  );

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error(e);
      Alert.alert('ログイン失敗', 'メールアドレスまたはパスワードが正しくありません');
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
            <Title style={styles.title}>SkillBoost5へようこそ</Title>
            <Paragraph style={styles.subtitle}>学習を始めましょう！</Paragraph>
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
            <PaperButton onPress={() => navigation.navigate('Register')}>新規登録</PaperButton>
            <PaperButton mode="contained" onPress={handleLogin} style={styles.button}>
              ログイン
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