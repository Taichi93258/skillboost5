import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebaseClient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const DEFAULT_MAX_LEVELS = 30;

export default function LevelsPage() {
  const router = useRouter();
  const { category } = router.query;
  const { user, loading } = useAuth();
  const [levels, setLevels] = useState([]);
  const [completedLevels, setCompletedLevels] = useState({});

  useEffect(() => {
    const fetchCompletedLevels = async () => {
      if (!user || !category) return;
      const ref = doc(db, 'progress', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setCompletedLevels((data.completedLevels?.[category]) || {});
      }
    };
    if (!loading) {
      fetchCompletedLevels();
    }
  }, [user, loading, category]);

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
      } catch {
        setLevels(Array.from({ length: DEFAULT_MAX_LEVELS }, (_, i) => i + 1));
      }
    };
    if (category) {
      fetchMaxLevels();
    }
  }, [category]);

  const toggleLevel = async (lvl) => {
    const ref = doc(db, 'progress', user.uid);
    const newState = !completedLevels[lvl];
    await updateDoc(ref, { [`completedLevels.${category}.${lvl}`]: newState });
    setCompletedLevels((prev) => ({ ...prev, [lvl]: newState }));
  };

  if (loading || !user || !category) {
    return null;
  }

  return (
    <div className="container">
      <h1>「{category}」のレベルを選択してください</h1>
      <div className="back">
        <Link href="/categories" className="backLink" aria-label="カテゴリ一覧へ">
          <span className="backIcon">←</span>
        </Link>
      </div>
      <div className="grid">
        {levels.map((lvl) => (
          <div key={lvl} className="gridItem">
            <Link
              href={`/quiz/${encodeURIComponent(category)}/${lvl}`}
              className={`card${completedLevels[lvl] ? ' card--done' : ''}`}
            >
              <div className="icon">{lvl}</div>
              <h2 className="title">レベル {lvl}</h2>
            </Link>
            <button
              className={`badge ${completedLevels[lvl] ? 'badge--done' : 'badge--todo'}`}
              onClick={() => toggleLevel(lvl)}
            >
              {completedLevels[lvl] ? '✓' : '○'}
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
          border: 2px solid transparent;
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
        .card--done {
          background: #F0FFF4;
          border-color: #38A169;
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
