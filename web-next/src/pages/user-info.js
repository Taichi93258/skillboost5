import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function UserInfoPage() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (loading || !user) {
    return null;
  }

  const handleReset = async () => {
    setError('');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage('パスワードリセット用のメールを送信しました');
    } catch (err) {
      console.error(err);
      setError('送信に失敗しました');
    }
  };

  return (
    <div className="container">
      <h1>ユーザー情報</h1>
      <p>ニックネーム: {user.displayName || '-'}</p>
      <p>メールアドレス: {user.email || '-'}</p>
      <button onClick={handleReset}>パスワードをリセット</button>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 16px;
        }
        button {
          padding: 8px 16px;
          background: #2575fc;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 8px;
        }
        .message {
          color: green;
        }
        .error {
          color: red;
        }
      `}</style>
    </div>
  );
}