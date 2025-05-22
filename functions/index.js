const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, OpenAIApi } = require('openai');

admin.initializeApp();
const openai = new OpenAIApi(new Configuration({ apiKey: functions.config().openai.key }));

const CATEGORIES = [
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
const LEVELS = [1, 2, 3];

exports.scheduledGenerateDailyQuestions = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    for (const category of CATEGORIES) {
      for (const level of LEVELS) {
        const docId = `${today}-${category}-${level}`;
        const docRef = db.collection('dailyQuestions').doc(docId);
        const snap = await docRef.get();
        if (snap.exists) continue;
        const systemPrompt = 'あなたはクイズ問題の作成アシスタントです。';
        const userPrompt = `
以下のカテゴリとレベルに応じて日本語の一問を生成してください。
- カテゴリ: ${category}
- レベル: ${level}

出力は JSON 形式で、キーを "prompt"（問題文）、"explanation"（解説文）として返してください。
`;
        const res = await openai.createChatCompletion({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        });
        let qa;
        try {
          qa = JSON.parse(res.data.choices[0].message.content);
        } catch {
          continue;
        }
        await docRef.set({ prompt: qa.prompt, explanation: qa.explanation });
      }
    }
    return null;
  });

exports.generateQuestion = functions.runWith({ memory: '256MB' }).https.onCall(
  async (data) => {
    const { category, level } = data;
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    const docId = `${today}-${category}-${level}`;
    const docRef = db.collection('dailyQuestions').doc(docId);
    const snap = await docRef.get();
    if (snap.exists) return snap.data();
    const systemPrompt = 'あなたはクイズ問題の作成アシスタントです。';
    const userPrompt = `
以下のカテゴリとレベルに応じて日本語の一問を生成してください。
- カテゴリ: ${category}
- レベル: ${level}

出力は JSON 形式で、キーを "prompt"（問題文）、"explanation"（解説文）として返してください。
`;
    const res = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
    });
    const qa = JSON.parse(res.data.choices[0].message.content);
    await docRef.set({ prompt: qa.prompt, explanation: qa.explanation });
    return qa;
  }
);