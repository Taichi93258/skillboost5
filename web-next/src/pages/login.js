import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/categories');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  return (
    <div className="container">
      <h1>SkillBoost5へようこそ</h1>
      <p>学習を始めましょう！</p>
      <form onSubmit={handleSubmit} className="card">
        {error && <p className="error">{error}</p>}
        <label>メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">ログイン</button>
        <div className="links">
          <Link href="/register">新規登録</Link>
          <Link href="/forgot-password">パスワードを忘れた場合</Link>
        </div>
      </form>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(to bottom, #6a11cb, #2575fc);
          color: #fff;
          padding: 16px;
        }
        .card {
          background: #fff;
          color: #000;
          padding: 24px;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        input {
          padding: 8px;
          width: 100%;
        }
        button {
          padding: 12px;
          background: #2575fc;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .links {
          display: flex;
          justify-content: space-between;
        }
        a {
          color: #2575fc;
          text-decoration: none;
        }
        .error {
          color: red;
        }
      `}</style>
    </div>
  );
}