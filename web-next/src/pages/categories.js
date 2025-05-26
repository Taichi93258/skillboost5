import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

const categoriesList = [
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

const categoryEmojis = {
  'ビジネストレンド': '📈',
  'IT': '💻',
  '健康': '❤️‍🩹',
  '経済・金融': '🏦',
  '国際情勢・時事': '🌐',
  'マーケティング・消費者行動': '📣',
  'プレゼンテーション・論理思考': '📊',
  '組織行動論・人間関係': '👥',
  '法務・ビジネス法基礎': '⚖️',
};

export default function CategoriesPage() {
  const { user, loading } = useAuth();
  const [completedCategories, setCompletedCategories] = useState({});
  const [progress, setProgress] = useState({ streakCount: 0, lastCompleted: '-' });

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      const ref = doc(db, 'progress', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setCompletedCategories(data.completedCategories || {});
        setProgress({
          streakCount: data.streakCount || 0,
          lastCompleted: data.lastCompleted || '-',
        });
      }
    };
    if (!loading) {
      fetchProgress();
    }
  }, [user, loading]);

  if (loading || !user) {
    return null;
  }

  const toggleCategory = async (cat) => {
    const ref = doc(db, 'progress', user.uid);
    const newState = !completedCategories[cat];
    await updateDoc(ref, { [`completedCategories.${cat}`]: newState });
    setCompletedCategories((prev) => ({ ...prev, [cat]: newState }));
  };

  return (
    <div className="container">
      <h1>カテゴリを選択してください</h1>
      <div className="progress">
        <div className="statItem">
          <div className="statNumber">{progress.streakCount}日</div>
          <div className="statLabel">連続学習日数</div>
        </div>
        <div className="statItem">
          <div className="statNumber">{progress.lastCompleted}</div>
          <div className="statLabel">最終学習日</div>
        </div>
      </div>
      <div className="grid">
        {categoriesList.map((cat) => (
          <div key={cat} className="gridItem">
            <Link
              href={`/categories/${encodeURIComponent(cat)}`}
              className="card"
            >
              <div className="icon">{categoryEmojis[cat] || '📁'}</div>
              <h2 className="title">{cat}</h2>
            </Link>
            <button
              className={`badge ${completedCategories[cat] ? 'badge--done' : 'badge--todo'}`}
              onClick={() => toggleCategory(cat)}
            >
              {completedCategories[cat] ? '✓' : '○'}
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 16px;
        }
        .progress {
          display: flex;
          justify-content: space-around;
          padding: 16px 0;
          margin-bottom: 16px;
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
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
        }
        .gridItem {
          position: relative;
        }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: var(--background);
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: inherit;
          transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .icon {
          font-size: 32px;
        }
        .title {
          margin-top: 8px;
          font-size: 16px;
          text-align: center;
        }
        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }
        .badge--done {
          background: #38A169;
          color: #fff;
        }
        .badge--todo {
          background: #E2E8F0;
          color: var(--foreground);
        }
      `}</style>
    </div>
  );
}