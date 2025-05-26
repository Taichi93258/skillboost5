import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
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
    if (!nickname) {
      setError('ニックネームを入力してください');
      return;
    }
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: nickname });
      router.replace('/categories');
    } catch (err) {
      console.error(err);
      let message = '登録に失敗しました';
      if (err.code === 'auth/email-already-in-use') {
        message = 'このメールアドレスは既に使用されています';
      } else if (err.code === 'auth/invalid-email') {
        message = '有効なメールアドレスを入力してください';
      } else if (err.code === 'auth/weak-password') {
        message = 'パスワードは6文字以上にしてください';
      }
      setError(message);
    }
  };

  return (
    <div className="container">
      <h1>新規登録</h1>
      <p>ニックネーム、メールアドレス、パスワードを登録してください。</p>
      <form onSubmit={handleSubmit} className="card">
        {error && <p className="error">{error}</p>}
        <label>ニックネーム</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
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
        <button type="submit">登録</button>
        <div className="links">
          <Link href="/login">戻る</Link>
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
          justify-content: flex-start;
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