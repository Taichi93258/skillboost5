import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Progress</Text>
      <Text style={styles.text}>Current Streak: {progress.streakCount} days</Text>
      <Text style={styles.text}>Last Completed: {progress.lastCompleted || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 8 },
});