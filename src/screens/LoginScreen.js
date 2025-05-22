import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import {
  Card,
  Title,
  Paragraph,
  Button as PaperButton,
  ActivityIndicator as PaperIndicator,
} from 'react-native-paper';
import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Categories');
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <PaperIndicator animating={true} size="large" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
      <Animatable.View animation="fadeInDown" style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>SkillBoost5へようこそ</Title>
            <Paragraph style={styles.subtitle}>学習を始めましょう！</Paragraph>
          </Card.Content>
          <Card.Actions>
            <PaperButton mode="contained" onPress={handleLogin} style={styles.button}>
              学習を始める
            </PaperButton>
          </Card.Actions>
        </Card>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16 },
  card: { width: '100%', maxWidth: 400 },
  button: { marginLeft: 'auto' },
});