import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebaseClient';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar({ isOpen, onClose }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (!isOpen || loading || !user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <nav className="sidebar">
        <Link href="/user-info">ユーザー情報</Link>
        <Link href="/categories">カテゴリ選択</Link>
        <Link href="/progress">進捗状況</Link>
        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </nav>
      <style jsx>{`
        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 200px;
          height: 100%;
          background: #fff;
          z-index: 11;
          padding: 48px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sidebar a,
        .logout-button {
          color: #333;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
