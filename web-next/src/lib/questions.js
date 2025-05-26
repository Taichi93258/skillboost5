import { firestore } from './firebaseAdmin';

export async function getAllQuestionIds() {
  const snapshot = await firestore.collection('dailyQuestions').get();
  return snapshot.docs.map((doc) => doc.id);
}

export async function getQuestionData(id) {
  const doc = await firestore.collection('dailyQuestions').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
}