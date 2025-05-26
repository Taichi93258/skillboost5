import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  return (
    <>
      {!loading && user && (
        <button className="menu-button" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="content">{children}</main>
      <style jsx>{`
        .menu-button {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 12;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #333;
        }
        .content {
          padding: 16px;
          margin-top: 48px;
        }
      `}</style>
    </>
  );
}