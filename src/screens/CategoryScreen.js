import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, Animated, FlatList, TouchableWithoutFeedback, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import {
  List,
  Avatar,
  Title,
  IconButton,
  Card,
  Paragraph,
  Badge,
  ActivityIndicator as PaperIndicator,
} from 'react-native-paper';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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

// icon mapping for each category (MaterialCommunityIcons)
const categoryIcons = {
  'ビジネストレンド': 'trending-up',
  'IT': 'laptop',
  '健康': 'heart-pulse',
  '経済・金融': 'bank',
  '国際情勢・時事': 'earth',
  'マーケティング・消費者行動': 'bullhorn',
  'プレゼンテーション・論理思考': 'presentation',
  '組織行動論・人間関係': 'account-group',
  '法務・ビジネス法基礎': 'gavel',
};

export default function CategoryScreen({ navigation }) {
  const [completedCategories, setCompletedCategories] = useState({});
  const [progress, setProgress] = useState({ lastCompleted: null, streakCount: 0 });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [animProgress] = useState(new Animated.Value(0));
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarAnimRef = useRef(null);
  const backdropAnimRef = useRef(null);

  const openSidebar = () => {
    setSidebarVisible(true);
  };

  const closeSidebar = async () => {
    if (sidebarAnimRef.current && backdropAnimRef.current) {
      try {
        await Promise.all([
          sidebarAnimRef.current.slideOutLeft(300, 'ease-out'),
          backdropAnimRef.current.fadeOut(300, 'ease-out'),
        ]);
      } catch {}
    }
    setSidebarVisible(false);
  };

  const closeSidebarAndNavigate = async (route) => {
    if (sidebarAnimRef.current && backdropAnimRef.current) {
      try {
        await Promise.all([
          sidebarAnimRef.current.slideOutLeft(300, 'ease-out'),
          backdropAnimRef.current.fadeOut(300, 'ease-out'),
        ]);
      } catch {}
    }
    setSidebarVisible(false);
    navigation.navigate(route);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon="menu"
          color="#fff"
          onPress={() => {
            sidebarVisible ? closeSidebar() : openSidebar();
          }}
        />
      ),
      headerBackVisible: false,
    });
  }, [navigation, sidebarVisible]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: !loadingProgress });
  }, [navigation, loadingProgress]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (e) {
      console.warn('Error signing out:', e);
    }
  };

  // fetch completed categories for list and progress metrics
  useEffect(() => {
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
    // fetch initial progress data on mount
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

  if (loadingProgress) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
          <View style={styles.loadingContainer}>
            <PaperIndicator animating size="large" color="#fff" />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
      <Animatable.View animation="fadeInDown" useNativeDriver style={styles.container}>
        {sidebarVisible && (
          <View style={styles.sidebarContainer}>
            <TouchableWithoutFeedback onPress={closeSidebar}>
              <Animatable.View
                ref={backdropAnimRef}
                animation="fadeIn"
                duration={300}
                useNativeDriver
                style={styles.backdrop}
              />
            </TouchableWithoutFeedback>
            <Animatable.View
              ref={sidebarAnimRef}
              animation="slideInLeft"
              duration={300}
              easing="ease-out"
              useNativeDriver
              style={styles.sidebar}
            >
              <List.Section>
                <List.Item
                  title="ユーザー情報"
                  titleStyle={styles.sidebarItemText}
                  left={(props) => <List.Icon {...props} icon="account" />}
                  onPress={() => closeSidebarAndNavigate('UserInfo')}
                />
                <List.Item
                  title="ログアウト"
                  titleStyle={styles.sidebarItemText}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="logout"
                      style={[props.style, { transform: [{ rotate: '180deg' }] }]}
                    />
                  )}
                  onPress={() =>
                    Alert.alert('ログアウトしますか？', '', [
                      { text: 'キャンセル', style: 'cancel' },
                      { text: 'はい', onPress: handleSignOut },
                    ])
                  }
                />
              </List.Section>
            </Animatable.View>
          </View>
        )}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.headerDark}>進捗状況</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>{progress.streakCount}日</Title>
                <Paragraph style={styles.statLabel}>連続学習日数</Paragraph>
              </View>
              <View style={styles.statItem}>
                <Title style={styles.statNumber}>{progress.lastCompleted || '-'}</Title>
                <Paragraph style={styles.statLabel}>最終学習日</Paragraph>
              </View>
            </View>
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
          </Card.Content>
        </Card>
        <Title style={styles.header}>カテゴリを選択してください</Title>
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item, index }) => (
            <Animatable.View
              animation="fadeInUp"
              delay={200 + index * 100}
              useNativeDriver
              style={styles.gridItem}
            >
              <Card style={styles.categoryCard} onPress={() => navigation.push('Levels', { category: item })}>
                <Card.Content style={styles.cardContent}>
                  <Avatar.Icon size={40} icon={categoryIcons[item] || 'folder'} />
                  <Title style={styles.cardTitle}>{item}</Title>
                  {completedCategories[item] && <Badge style={styles.badge}>✓</Badge>}
                </Card.Content>
              </Card>
            </Animatable.View>
          )}
        />
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradientBackground: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#fff' },
  headerDark: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#000' },
  paragraph: { color: '#fff' },
  paragraphDark: { color: '#000' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 14, color: '#555' },
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
  listSection: { flex: 1 },
  scrollView: { flex: 1 },
  item: { backgroundColor: 'transparent' },
  itemText: { fontSize: 18, color: '#fff' },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: 200,
    height: '100%',
    backgroundColor: '#fff',
    padding: 16,
  },
  sidebarItemText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  gridItem: {
    flex: 1,
    margin: 8,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});