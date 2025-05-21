import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function QuizScreen({ route, navigation }) {
  const { category } = route.params;
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'dailyQuestions', `${today}-${category}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuestion(docSnap.data());
      } else {
        setQuestion({ prompt: 'No question for today.', explanation: '' });
      }
      setLoading(false);
    };
    fetchQuestion();
  }, [category]);

  const handleComplete = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const progressRef = doc(db, 'progress', user.uid);
      const today = new Date().toISOString().split('T')[0];
      await setDoc(progressRef, { lastCompleted: today }, { merge: true });
      navigation.navigate('Progress');
    } catch (e) {
      Alert.alert('Error', 'Could not record progress.');
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
    <View style={styles.container}>
      <Text style={styles.category}>{category}</Text>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.explanation ? <Text style={styles.explanation}>{question.explanation}</Text> : null}
      <Button title="Mark as Complete" onPress={handleComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  category: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  prompt: { fontSize: 18, marginBottom: 8 },
  explanation: { fontSize: 16, color: '#555', marginBottom: 16 },
});