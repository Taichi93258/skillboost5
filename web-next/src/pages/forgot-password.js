import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('パスワードリセット用のメールを送信しました');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      console.error(err);
      let msg = '送信に失敗しました';
      if (err.code === 'auth/invalid-email') {
        msg = '有効なメールアドレスを入力してください';
      } else if (err.code === 'auth/user-not-found') {
        msg = '指定されたメールアドレスのユーザーは存在しません';
      }
      setError(msg);
    }
  };

  return (
    <div className="container">
      <h1>パスワードを忘れた場合</h1>
      <p>登録済みのメールアドレスを入力してください。</p>
      <form onSubmit={handleSubmit} className="card">
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
        <label>メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">送信</button>
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
        .message {
          color: green;
        }
      `}</style>
    </div>
  );
}