const admin = require('firebase-admin');

admin.initializeApp();

async function migrate() {
  const db = admin.firestore();
  const batchSize = 500;
  const snapshot = await db.collection('dailyQuestions').get();
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + batchSize);
    for (const docSnap of chunk) {
      const id = docSnap.id;
      const dateStr = id.slice(0, 10);
      const date = admin.firestore.Timestamp.fromDate(new Date(dateStr));
      batch.update(docSnap.ref, { date });
    }
    await batch.commit();
    console.log(`Processed ${Math.min(i + batchSize, docs.length)} of ${docs.length}`);
  }
  console.log('Migration complete');
}

migrate().catch(error => {
  console.error('Migration failed', error);
  process.exit(1);
});