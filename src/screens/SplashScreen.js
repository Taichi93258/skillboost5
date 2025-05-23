import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SplashScreen({ navigation }) {
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
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
      <View style={styles.container}>
        <Animatable.Text animation="bounceIn" iterationCount={1} style={styles.title}>
          SkillBoost5
        </Animatable.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
});