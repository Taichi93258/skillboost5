import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { mode, oobCode } = router.query;
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (mode !== 'resetPassword' || !oobCode) {
      setError('パスワードリセットのリクエストが無効です');
      setVerifying(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => setEmail(email))
      .catch((err) => {
        console.error(err);
        setError('パスワードリセットのリクエストが無効です');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [router.isReady, mode, oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('パスワードを変更しました');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/weak-password') {
        setError('パスワードは6文字以上にしてください');
      } else {
        setError('パスワードの変更に失敗しました');
      }
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, router]);

  if (verifying) {
    return (
      <div className="container">
        <div className="spinner" />
        <style jsx>{`
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">パスワード再設定</h1>
        {error && <p className="error">{error}</p>}
        {!error && !message && (
          <>
            {email && <p className="subtitle">{email} のパスワードを変更します</p>}
            <form onSubmit={handleSubmit} className="form">
              <input
                type="password"
                placeholder="新しいパスワード"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">パスワードを変更する</button>
            </form>
            <div className="links">
              <Link href="/login">戻る</Link>
            </div>
          </>
        )}
        {message && <p className="message">{message}</p>}
      </div>
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeInDown 0.8s ease-out;
        }
        .title {
          font-size: 24px;
          margin: 0 0 8px;
          text-align: center;
        }
        .subtitle {
          font-size: 16px;
          margin: 0 0 16px;
          text-align: center;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        input {
          padding: 10px;
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
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
          color: #f44336;
          text-align: center;
        }
        .message {
          color: #4caf50;
          text-align: center;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}