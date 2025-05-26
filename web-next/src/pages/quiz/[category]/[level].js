import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const DEFAULT_MAX_LEVELS = 30;

export default function QuizPage() {
  const router = useRouter();
  const { category, level } = router.query;
  const { user, loading } = useAuth();
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [question, setQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressData, setProgressData] = useState({ streakCount: 0, lastCompleted: null });
  const [maxLevels, setMaxLevels] = useState(DEFAULT_MAX_LEVELS);

  useEffect(() => {
    const fetchMaxLevels = async () => {
      try {
        const cfgSnap = await getDoc(doc(db, 'config', 'levels'));
        if (cfgSnap.exists()) {
          const raw = cfgSnap.data().maxLevels?.[category];
          const num = Number(raw);
          if (!isNaN(num) && num > 0) {
            setMaxLevels(num);
          }
        }
      } catch {}
    };
    if (category) {
      fetchMaxLevels();
    }
  }, [category]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!user || !category || !level) return;
      setShowAnswer(false);
      setLoadingQuestion(true);
      const date = process.env.NEXT_PUBLIC_DAILY_QUESTION_DATE;
      const ref = doc(db, 'dailyQuestions', `${date}-${category}-${level}`);
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setQuestion(snap.data());
        } else {
          setQuestion({ prompt: '本日の問題はありません。', explanation: '' });
        }
      } catch (error) {
        console.warn('Error fetching question:', error);
        setQuestion({ prompt: '現在、問題を読み込めません。', explanation: '' });
      } finally {
        setLoadingQuestion(false);
      }
    };
    if (!loading) {
      fetchQuestion();
    }
  }, [user, loading, category, level]);

  const handleComplete = async () => {
    if (!user || !category || !level) return;
    const ref = doc(db, 'progress', user.uid);
    const today = new Date().toISOString().split('T')[0];
    const progressSnap = await getDoc(ref);
    let streakCount = 1;
    let completedCategories = {};
    let completedLevels = {};
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      const prevLast = data.lastCompleted;
      const prevStreak = data.streakCount || 0;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (prevLast === yesterday) {
        streakCount = prevStreak + 1;
      }
      completedCategories = data.completedCategories || {};
      completedLevels = data.completedLevels || {};
    }
    if (!completedLevels[category]) {
      completedLevels[category] = {};
    }
    completedLevels[category][level] = true;
    const totalLevels = Object.keys(completedLevels[category]).length;
    completedCategories[category] = totalLevels === maxLevels;
    await setDoc(
      ref,
      { lastCompleted: today, streakCount, completedCategories, completedLevels },
      { merge: true }
    );
    setProgressData({ streakCount, lastCompleted: today });
    setProgressVisible(true);
  };

  if (loading || !user || loadingQuestion) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="container">
      <h1>{category}</h1>
      <div className="back">
        <Link
          href={`/categories/${encodeURIComponent(category)}`}
          className="backLink"
          aria-label="レベル選択へ"
        >
          <span className="backIcon">←</span>
        </Link>
      </div>
      <div className="card">
        <p>{question.prompt}</p>
      </div>
      {question.explanation && (
        <>
          <button onClick={() => setShowAnswer(true)}>回答を見る</button>
          {showAnswer && (
            <div className="dialog">
              <div className="dialog-content">
                <p>{question.explanation}</p>
                <button onClick={() => setShowAnswer(false)}>閉じる</button>
              </div>
            </div>
          )}
        </>
      )}
      <button onClick={handleComplete} className="complete-button">
        完了する
      </button>
      {progressVisible && (
        <div className="dialog">
          <div className="dialog-content">
            <div className="stats">
              <div className="statItem">
                <div className="statNumber">{progressData.streakCount}日</div>
                <div className="statLabel">連続学習日数</div>
              </div>
              <div className="statItem">
                <div className="statNumber">{progressData.lastCompleted}</div>
                <div className="statLabel">最終学習日</div>
              </div>
            </div>
            <button onClick={() => setProgressVisible(false)}>閉じる</button>
          </div>
        </div>
      )}
      <style jsx>{`
        .back {
          margin-bottom: 16px;
        }
        .backLink {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
        }

        .backIcon {
          width: 30px;
          height: 30px;
          margin: 2% 0 4% 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          font-size: 15px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .backLink:hover .backIcon {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 16px;
        }
        .card {
          background: #f0f0f0;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        button {
          margin-top: 8px;
          padding: 8px 16px;
          background: #2575fc;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .complete-button {
          background: #36d1dc;
          margin: 1%;
        }
        .dialog {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }
        .dialog-content {
          background: #fff;
          padding: 24px;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          padding: 16px 0;
        }
        .statItem {
          text-align: center;
        }
        .statNumber {
          font-size: 24px;
          font-weight: bold;
        }
        .statLabel {
          font-size: 14px;
          color: #555;
        }
      `}</style>
    </div>
  );
}
