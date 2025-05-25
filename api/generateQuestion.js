import { Configuration, OpenAIApi } from 'openai';
import { admin } from './_firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  try {
    const { category, level } = req.body;
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    const docId = `${today}-${category}-${level}`;
    const docRef = db.collection('dailyQuestions').doc(docId);
    const snap = await docRef.get();
    if (snap.exists) {
      return res.status(200).json(snap.data());
    }
    const systemPrompt = 'あなたはクイズ問題の作成アシスタントです。';
    const userPrompt = `
以下のカテゴリとレベルに応じて日本語の一問を生成してください。
- カテゴリ: ${category}
- レベル: ${level}

出力は JSON 形式で、キーを "prompt"（問題文）、"explanation"（解説文）として返してください。
`;
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });
    let qa;
    try {
      qa = JSON.parse(completion.data.choices[0].message.content);
    } catch {
      return res.status(500).json({ error: 'OpenAI response parse error' });
    }
    await docRef.set({ prompt: qa.prompt, explanation: qa.explanation });
    return res.status(200).json(qa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}