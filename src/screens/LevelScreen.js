import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Avatar, IconButton, List, Title } from 'react-native-paper';
import { auth, db } from '../firebase';

const DEFAULT_MAX_LEVELS = 30;

export default function LevelScreen({ route, navigation }) {
  const { category } = route.params;
  const [levels, setLevels] = useState([]);
  const [completedLevels, setCompletedLevels] = useState({});

  useEffect(() => {
    const fetchCompletedLevels = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const progressRef = doc(db, 'progress', user.uid);
      try {
        const docSnap = await getDoc(progressRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompletedLevels((data.completedLevels?.[category]) || {});
        }
      } catch (e) {
        if (e.code === 'unavailable') {
          try {
            const cacheSnap = await getDoc(progressRef, { source: 'cache' });
            if (cacheSnap.exists()) {
              const data = cacheSnap.data();
              setCompletedLevels((data.completedLevels?.[category]) || {});
            } else {
              setCompletedLevels({});
            }
          } catch {
            setCompletedLevels({});
          }
        } else {
          console.warn('Error fetching completed levels:', e);
        }
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchCompletedLevels);
    fetchCompletedLevels();
    return unsubscribe;
  }, [navigation, category]);

  // fetch max levels per category from Firestore config
  useEffect(() => {
    const fetchMaxLevels = async () => {
      try {
        const cfgSnap = await getDoc(doc(db, 'config', 'levels'));
        let count = DEFAULT_MAX_LEVELS;
        if (cfgSnap.exists()) {
          const raw = cfgSnap.data().maxLevels?.[category];
          const num = Number(raw);
          if (!isNaN(num) && num > 0) {
            count = num;
          }
        }
        setLevels(Array.from({ length: count }, (_, i) => i + 1));
      } catch (e) {
        console.warn('Error fetching max levels config:', e);
        setLevels(Array.from({ length: DEFAULT_MAX_LEVELS }, (_, i) => i + 1));
      }
    };
    fetchMaxLevels();
  }, [category]);

  // toggle a level's completed status
  const toggleLevel = async (lvl) => {
    const user = auth.currentUser;
    if (!user) return;
    const progressRef = doc(db, 'progress', user.uid);
    const newState = !completedLevels[lvl];
    try {
      await updateDoc(progressRef, { [`completedLevels.${category}.${lvl}`]: newState });
      setCompletedLevels((prev) => ({ ...prev, [lvl]: newState }));
    } catch (e) {
      console.warn('Error toggling level completed:', e);
    }
  };

  return (
    <LinearGradient colors={['#2575fc', '#6a11cb']} style={styles.gradientBackground}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animatable.View animation="fadeInDown" duration={800}>
          <Title style={styles.header}>「{category}」のレベルを選択してください</Title>
        </Animatable.View>
        <List.Section>
          <Animatable.View animation="fadeInUp" delay={200}>
            <List.Item
              title="Top"
              titleStyle={styles.itemText}
              onPress={() => navigation.popToTop()}
              left={(props) => <Avatar.Icon {...props} icon="home" />}
            />
          </Animatable.View>
          {levels.map((item, idx) => (
            <Animatable.View key={item.toString()} animation="fadeInUp" delay={300 + idx * 50}>
              <List.Item
                title={`レベル ${item}`}
                titleStyle={styles.itemText}
                onPress={() => navigation.push('Quiz', { category, level: item, maxLevels: levels.length })}
                left={(props) => <Avatar.Icon {...props} icon="star" />}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon={
                      completedLevels[item]
                        ? 'check-circle'
                        : 'checkbox-blank-circle-outline'
                    }
                    color="#fff"
                    onPress={() => toggleLevel(item)}
                  />
                )}
              />
            </Animatable.View>
          ))}
        </List.Section>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#fff' },
  itemText: { fontSize: 18, color: '#fff' },
});
