import React from 'react';

interface NavbarProps {
  activeTab: 'arena' | 'auction' | 'guild';
  setActiveTab: (tab: 'arena' | 'auction' | 'guild') => void;
  user: { username: string; email: string; elo: number; role: string; avatar?: string } | null;
  goldBalance: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  goldBalance,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid var(--border-dim)',
      backgroundColor: 'rgba(6, 9, 19, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#000', fontSize: '1.2rem' }}>B</span>
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.3rem',
            fontWeight: 800,
            letterSpacing: '2px',
            background: 'linear-gradient(90deg, #fff, var(--neon-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
          }}>
            BER-ARENA
          </h1>
          <span style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', letterSpacing: '1px' }}>
            ● SERVER ONLINE (PORT 3000)
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-dim)' }}>
        <button
          onClick={() => setActiveTab('arena')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'arena' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(157, 78, 221, 0.25))' : 'transparent',
            color: activeTab === 'arena' ? 'var(--neon-cyan)' : 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ⚔️ BÀN CỜ 4x5
        </button>
        <button
          onClick={() => setActiveTab('auction')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'auction' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(157, 78, 221, 0.25))' : 'transparent',
            color: activeTab === 'auction' ? 'var(--neon-cyan)' : 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          🏷️ CHỢ ĐẤU GIÁ
        </button>
        <button
          onClick={() => setActiveTab('guild')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'guild' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(157, 78, 221, 0.25))' : 'transparent',
            color: activeTab === 'guild' ? 'var(--neon-cyan)' : 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          🛡️ BANG HỘI
        </button>
      </nav>

      {/* Right Controls: Wallet & Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Ví tiền 1000 vàng */}
        <div className="gold-badge" title="Số dư Ví Vàng (ACID & Optimistic Locking)">
          <span>🪙</span>
          <span>{goldBalance.toLocaleString()}</span>
          <span style={{ fontSize: '0.75rem', color: '#fef08a' }}>VÀNG</span>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-heading)' }}>
                ⭐ {user.elo} ELO
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 56, 100, 0.15)',
                border: '1px solid rgba(255, 56, 100, 0.4)',
                color: '#ff3864',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <button className="tactical-btn" onClick={onOpenAuth}>
            🔑 ĐĂNG NHẬP / ĐĂNG KÝ
          </button>
        )}
      </div>
    </header>
  );
};
