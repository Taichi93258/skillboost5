import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Card, Title, Paragraph, ActivityIndicator as PaperIndicator } from 'react-native-paper';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ lastCompleted: null, streakCount: 0 });

  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const progressRef = doc(db, 'progress', user.uid);
      const docSnap = await getDoc(progressRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProgress({
          lastCompleted: data.lastCompleted,
          streakCount: data.streakCount || 0
        });
      }
      setLoading(false);
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <PaperIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#5b86e5', '#36d1dc']} style={styles.gradientBackground}>
      <Animatable.View animation="fadeInDown" style={styles.container}>
        <Card style={styles.card}>
          <LinearGradient colors={['#36d1dc', '#5b86e5']} style={styles.cardHeaderGradient}>
            <Title style={styles.headerGradientText}>進捗状況</Title>
          </LinearGradient>
          <Card.Content>
            <Paragraph style={styles.text}>連続学習日数: {progress.streakCount}日</Paragraph>
            <Paragraph style={styles.text}>最終学習日: {progress.lastCompleted || '-'}</Paragraph>
          </Card.Content>
        </Card>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, padding: 16, alignItems: 'center' },
  cardHeaderGradient: { padding: 12, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  headerGradientText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  text: { fontSize: 16, marginBottom: 8 },
  card: { width: '100%', marginBottom: 16 },
});