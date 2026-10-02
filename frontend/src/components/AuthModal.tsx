import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Trạng thái riêng biệt cho Đăng nhập
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Trạng thái riêng biệt cho Đăng ký
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleTabChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { identifier: loginIdentifier.trim(), password: loginPassword }
          : { username: regUsername.trim(), email: regEmail.trim(), password: regPassword };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        let msg = 'Thao tác không thành công';
        if (data) {
          if (Array.isArray(data.message)) {
            msg = data.message.join('. ');
          } else if (typeof data.message === 'string') {
            msg = data.message;
          } else if (data.error) {
            msg = data.error;
          }
        }
        throw new Error(msg);
      }

      // Lưu accessToken vào localStorage
      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      setSuccessMsg(mode === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký thành công! +1.000 Vàng đã nạp vào ví');

      setTimeout(() => {
        onSuccess(data.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối tới máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Chuyển hướng tới endpoint Google OAuth của backend
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="tactical-panel"
        style={{
          padding: '32px',
          width: '100%',
          maxWidth: '430px',
          position: 'relative',
        }}
      >
        {/* Nút đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '1.25rem',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          title="Đóng"
        >
          ✕
        </button>

        {/* Header Modal */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              letterSpacing: '2px',
              color: 'var(--neon-cyan)',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            ● CHỈ HUY HỆ THỐNG
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.5rem', letterSpacing: '1px' }}>
            {mode === 'login' ? 'ĐĂNG NHẬP CHIẾN TRƯỜNG' : 'TẠO TÀI KHOẢN MỚI'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '6px' }}>
            {mode === 'login'
              ? 'Nhập Email hoặc Username để tiếp tục phiên đấu'
              : 'Đăng ký ngay để nhận miễn phí 1.000 Vàng trong ví'}
          </p>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: mode === 'login' ? 'var(--neon-cyan)' : 'transparent',
              color: mode === 'login' ? '#000' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: mode === 'register' ? 'var(--neon-cyan)' : 'transparent',
              color: mode === 'register' ? '#000' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ĐĂNG KÝ (+1000 🪙)
          </button>
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(255, 51, 102, 0.15)',
              border: '1px solid var(--neon-red)',
              color: '#ff3366',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Thông báo thành công */}
        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            ✅ {successMsg}
          </div>
        )}

        {/* Biểu mẫu Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'login' ? (
            <>
              {/* Form Đăng nhập */}
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '6px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Email hoặc Tên tài khoản (Username)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="warrior@berarena.com hoặc ber_warrior"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-tactical)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '6px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-tactical)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {/* Form Đăng ký */}
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '6px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Tên tài khoản (Username, tối thiểu 3 ký tự)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  minLength={3}
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="ber_warrior"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-tactical)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '6px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Địa chỉ Email chính xác
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="player@example.com"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-tactical)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '6px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Mật khẩu (Tối thiểu 6 ký tự)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-tactical)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          {/* Nút Submit Form */}
          <button
            type="submit"
            disabled={loading}
            className="tactical-btn"
            style={{
              width: '100%',
              padding: '13px',
              marginTop: '8px',
              fontSize: '0.95rem',
              fontWeight: 800,
            }}
          >
            {loading ? 'ĐANG XỬ LÝ...' : mode === 'login' ? '⚔️ XÁC NHẬN ĐĂNG NHẬP' : '🛡️ TẠO TÀI KHOẢN (+1000 🪙)'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '22px 0 16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>HOẶC</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Nút Đăng nhập Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '11px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '8px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          ĐĂNG NHẬP VỚI GOOGLE
        </button>
      </div>
    </div>
  );
};
