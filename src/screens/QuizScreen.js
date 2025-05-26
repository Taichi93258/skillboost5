import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Card, Button as PaperButton, Dialog, Portal, Paragraph, Title } from 'react-native-paper';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DAILY_QUESTION_DATE } from '@env';

const DEFAULT_MAX_LEVELS = 5;

export default function QuizScreen({ route, navigation }) {
  const { category, level } = route.params;
  const maxLevels = route.params.maxLevels ?? DEFAULT_MAX_LEVELS;
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [visible, setVisible] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressData, setProgressData] = useState({ streakCount: 0, lastCompleted: null });

  useEffect(() => {
    setVisible(false);
    const fetchQuestion = async () => {
    const date = DAILY_QUESTION_DATE;
    const docRef = doc(db, 'dailyQuestions', `${date}-${category}-${level}`);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuestion(docSnap.data());
        } else {
          setQuestion({ prompt: '本日の問題はありません。', explanation: '' });
        }
      } catch (error) {
        if (error.code === 'unavailable') {
          try {
            const cacheSnap = await getDoc(docRef, { source: 'cache' });
            if (cacheSnap.exists()) {
              setQuestion(cacheSnap.data());
            } else {
              setQuestion({ prompt: 'オフライン時にキャッシュされた問題はありません。', explanation: '' });
            }
          } catch (cacheError) {
            if (cacheError.code === 'unavailable') {
              setQuestion({ prompt: 'オフライン時にキャッシュされた問題はありません。', explanation: '' });
            } else {
              console.warn('Error fetching question from cache:', cacheError);
              setQuestion({ prompt: '現在、問題を読み込めません。', explanation: '' });
            }
          }
        } else {
          console.warn('Error fetching question:', error);
          setQuestion({ prompt: '現在、問題を読み込めません。', explanation: '' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [category, level]);

  const handleComplete = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
    const progressRef = doc(db, 'progress', user.uid);
    const today = new Date().toISOString().split('T')[0];

    const progressSnap = await getDoc(progressRef);
    let streakCount = 1;
    let completedCategoriesMap = {};
    let completedLevelsMap = {};
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      const prevLast = data.lastCompleted;
      const prevStreak = data.streakCount || 0;
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split('T')[0];
      if (prevLast === yesterday) {
        streakCount = prevStreak + 1;
      }
      completedCategoriesMap = data.completedCategories || {};
      completedLevelsMap = data.completedLevels || {};
    }
    if (!completedLevelsMap[category]) {
      completedLevelsMap[category] = {};
    }
    completedLevelsMap[category][level] = true;
    const totalLevels = Object.keys(completedLevelsMap[category]).length;
    completedCategoriesMap[category] = totalLevels === maxLevels;

    await setDoc(
      progressRef,
      {
        lastCompleted: today,
        streakCount,
        completedCategories: completedCategoriesMap,
        completedLevels: completedLevelsMap,
      },
      { merge: true }
    );
    setProgressData({ streakCount, lastCompleted: today });
    setProgressVisible(true);
    } catch (e) {
      Alert.alert('エラー', '進捗を記録できませんでした。');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#36d1dc', '#5b86e5']} style={styles.gradientBackground}>
      <Animatable.View animation="fadeInDown" style={styles.container}>
        <Animatable.View animation="fadeInUp" delay={200}>
          <Card style={styles.card}>
            <LinearGradient colors={['#5b86e5', '#2193b0']} style={styles.cardHeaderGradient}>
              <Title style={styles.cardHeaderText}>{category}</Title>
            </LinearGradient>
            <Card.Content>
              <Paragraph style={styles.prompt}>{question.prompt}</Paragraph>
            </Card.Content>
          </Card>
        </Animatable.View>
        {question.explanation && (
          <Animatable.View animation="fadeInUp" delay={400}>
            <PaperButton mode="outlined" onPress={() => setVisible(true)} style={styles.button}>
              回答を見る
            </PaperButton>
          </Animatable.View>
        )}
        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>回答</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{question.explanation}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={() => setVisible(false)}>閉じる</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Animatable.View animation="bounceIn" delay={600}>
          <PaperButton mode="contained" onPress={handleComplete} style={styles.completeButton}>
            完了する
          </PaperButton>
        </Animatable.View>
        <Portal>
          <Dialog visible={progressVisible} onDismiss={() => setProgressVisible(false)}>
            <Dialog.Title>進捗状況</Dialog.Title>
            <Dialog.Content>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Title style={styles.statNumber}>{progressData.streakCount}日</Title>
                  <Paragraph style={styles.statLabel}>連続学習日数</Paragraph>
                </View>
                <View style={styles.statItem}>
                  <Title style={styles.statNumber}>{progressData.lastCompleted}</Title>
                  <Paragraph style={styles.statLabel}>最終学習日</Paragraph>
                </View>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton onPress={() => setProgressVisible(false)}>閉じる</PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, padding: 16 },
  cardHeaderGradient: { padding: 12, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  cardHeaderText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  prompt: { fontSize: 18, marginBottom: 8 },
  card: { marginBottom: 16 },
  button: { marginVertical: 8 },
  completeButton: { marginTop: 16 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#555' },
});