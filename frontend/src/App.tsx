import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GameBoard } from './components/GameBoard';
import { AuctionHouse } from './components/AuctionHouse';
import { GuildDashboard } from './components/GuildDashboard';
import { AuthModal } from './components/AuthModal';
import { GravityStarsBackground } from '@/components/animate-ui/components/backgrounds/gravity-stars';

export function App() {
  const [activeTab, setActiveTab] = useState<'arena' | 'auction' | 'guild'>('arena');
  const [goldBalance, setGoldBalance] = useState(1000);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string; elo: number; role: string } | null>(null);

  // Khôi phục user từ localStorage nếu đã đăng nhập trước đó
  useEffect(() => {
    const savedUser = localStorage.getItem('ber_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ber_user');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser({
      username: loggedInUser.username,
      email: loggedInUser.email,
      elo: loggedInUser.elo || 1000,
      role: loggedInUser.role || 'PLAYER',
    });
    localStorage.setItem('ber_user', JSON.stringify(loggedInUser));
    // Tự động nạp 1000 vàng khi đăng ký/đăng nhập
    setGoldBalance(1000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('ber_user');
    setUser(null);
  };

  const handlePlaceBid = (amount: number) => {
    setGoldBalance((prev) => Math.max(0, prev - amount));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background hiệu ứng Gravity Stars */}
      <GravityStarsBackground
        className="absolute inset-0 flex items-center justify-center rounded-xl"
        starsCount={90}
        starsSize={2}
        starsOpacity={0.85}
        glowIntensity={18}
        movementSpeed={0.35}
        mouseInfluence={160}
        mouseGravity="attract"
        gravityStrength={65}
      />

      {/* Thanh điều hướng Navbar */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          goldBalance={goldBalance}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Nội dung chính theo Tab */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        {activeTab === 'arena' && <GameBoard />}
        {activeTab === 'auction' && (
          <AuctionHouse goldBalance={goldBalance} onPlaceBid={handlePlaceBid} />
        )}
        {activeTab === 'guild' && <GuildDashboard />}
      </main>

      {/* Modal Đăng nhập / Đăng ký / Google OAuth */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Footer System Status */}
      <footer style={{
        textAlign: 'center',
        padding: '16px',
        borderTop: '1px solid var(--border-dim)',
        color: 'var(--text-dim)',
        fontSize: '0.75rem',
        position: 'relative',
        zIndex: 10,
      }}>
        BER-ARENA © 2026 — Kiến trúc Hệ thống Phân tán, Server-Authoritative FSM & Concurrency Benchmark
      </footer>
    </div>
  );
}

export default App;
