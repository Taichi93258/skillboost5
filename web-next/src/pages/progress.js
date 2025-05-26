import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState({ streakCount: 0, lastCompleted: null });

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      const ref = doc(db, 'progress', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
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

  return (
    <div className="container">
      <h1>進捗状況</h1>
      <div className="stats">
        <div className="statItem">
          <div className="statNumber">{progress.streakCount}日</div>
          <div className="statLabel">連続学習日数</div>
        </div>
        <div className="statItem">
          <div className="statNumber">{progress.lastCompleted}</div>
          <div className="statLabel">最終学習日</div>
        </div>
      </div>
      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 16px;
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