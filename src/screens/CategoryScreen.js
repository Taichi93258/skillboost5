import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { List, Avatar, Title, IconButton, Card, Paragraph, ActivityIndicator as PaperIndicator } from 'react-native-paper';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const categories = [
  'ビジネストレンド',
  'IT',
  '健康',
  '経済・金融',
  '国際情勢・時事',
  'マーケティング・消費者行動',
  'プレゼンテーション・論理思考',
  '組織行動論・人間関係',
  '法務・ビジネス法基礎',
];

export default function CategoryScreen({ navigation }) {
  const [completedCategories, setCompletedCategories] = useState({});
  const [progress, setProgress] = useState({ lastCompleted: null, streakCount: 0 });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [animProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    // fetch completed categories for list and progress metrics
    const fetchProgressData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const progressRef = doc(db, 'progress', user.uid);
      try {
        const docSnap = await getDoc(progressRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompletedCategories(data.completedCategories || {});
          setProgress({ lastCompleted: data.lastCompleted, streakCount: data.streakCount || 0 });
        }
      } catch (e) {
        console.warn('Error fetching progress data:', e);
      } finally {
        setLoadingProgress(false);
      }
    };
    const unsubscribe = navigation.addListener('focus', fetchProgressData);
    fetchProgressData();
    return unsubscribe;
  }, [navigation]);

  // animate progress bar when data loaded or completedCategories changes
  useEffect(() => {
    if (!loadingProgress) {
      const total = categories.length;
      const completedCount = Object.values(completedCategories).filter(Boolean).length;
      const percent = total > 0 ? completedCount / total : 0;
      Animated.timing(animProgress, {
        toValue: percent,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [completedCategories, loadingProgress]);

  // toggle a category's completed status
  const toggleCategory = async (cat) => {
    const user = auth.currentUser;
    if (!user) return;
    const progressRef = doc(db, 'progress', user.uid);
    const newState = !completedCategories[cat];
    try {
      await updateDoc(progressRef, { [`completedCategories.${cat}`]: newState });
      setCompletedCategories((prev) => ({ ...prev, [cat]: newState }));
    } catch (e) {
      console.warn('Error toggling category completed:', e);
    }
  };

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
      <Animatable.View animation="fadeInDown" style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.headerDark}>進捗状況</Title>
            {loadingProgress ? (
              <PaperIndicator animating size="small" color="#000" />
            ) : (
              <>
                <Paragraph style={styles.paragraphDark}>
                  連続学習日数: {progress.streakCount}日
                </Paragraph>
                <Paragraph style={styles.paragraphDark}>
                  最終学習日: {progress.lastCompleted || '-'}
                </Paragraph>
                <View style={styles.progressContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: animProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                <Paragraph style={styles.progressTextDark}>
                  カテゴリ完了数: {Object.values(completedCategories).filter(Boolean).length}/{categories.length}
                </Paragraph>
              </>
            )}
          </Card.Content>
        </Card>
        <Title style={styles.header}>カテゴリを選択してください</Title>
        <ScrollView style={styles.scrollView}>
          <List.Section>
          {categories.map((item, idx) => (
            <Animatable.View key={item} animation="fadeInUp" delay={200 + idx * 100}>
              <List.Item
                title={item}
                titleStyle={styles.itemText}
                onPress={() => navigation.push('Levels', { category: item })}
                left={(props) => <Avatar.Icon {...props} icon="folder" />}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon={
                      completedCategories[item]
                        ? 'check-circle'
                        : 'checkbox-blank-circle-outline'
                    }
                    color="#fff"
                    onPress={() => toggleCategory(item)}
                  />
                )}
              />
            </Animatable.View>
          ))}
          </List.Section>
        </ScrollView>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#fff' },
  headerDark: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#000' },
  paragraph: { color: '#fff' },
  paragraphDark: { color: '#000' },
  progressContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2575fc',
    borderRadius: 5,
  },
  progressText: { marginTop: 8, fontWeight: 'bold', color: '#fff' },
  progressTextDark: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  card: { width: '100%', marginBottom: 16 },
  scrollView: { flex: 1 },
  itemText: { fontSize: 18, color: '#fff' },
});