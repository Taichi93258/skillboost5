import React, { useEffect } from 'react';
import { StyleSheet, View, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import { auth } from '../firebase';
import { onAuthStateChanged, applyActionCode } from 'firebase/auth';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    (async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const oobCode = new URL(url).searchParams.get('oobCode');
        if (oobCode) {
          try {
            await applyActionCode(auth, oobCode);
            await auth.currentUser.reload();
            Alert.alert('認証完了', 'メールアドレスの認証が完了しました');
          } catch (e) {
            Alert.alert('認証失敗', e.message);
          }
        }
      }
    })();
  }, []);

  useEffect(() => {
    let timer;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      timer = setTimeout(() => {
        navigation.replace(user ? 'Categories' : 'Login');
      }, 1500);
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[
        '#6a11cb',
        '#2575fc',
      ]} style={styles.gradientBackground}>
        <View style={styles.container}>
          <Animatable.Text animation="bounceIn" iterationCount={1} style={styles.title}>
            SkillBoost5
          </Animatable.Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradientBackground: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
});