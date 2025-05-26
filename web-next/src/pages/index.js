import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export default function SplashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/categories' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="splash">
      <h1 className="title">SkillBoost5</h1>
      <style jsx>{`
        .splash {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(to bottom, #6a11cb, #2575fc);
          color: #fff;
        }
        .title {
          font-size: 48px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}