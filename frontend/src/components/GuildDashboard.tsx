import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';

interface Member {
  id: string;
  name: string;
  role: 'Chủ Bang' | 'Phó Bang' | 'Thành Viên' | 'Tập Sự';
  elo: number;
  joinedAt: string;
}

export const GuildDashboard: React.FC = () => {
  const [inGuild, setInGuild] = useState(true);
  const [cooldownHours, setCooldownHours] = useState<number | null>(null);

  const members: Member[] = [
    { id: '1', name: 'Commander_Ber', role: 'Chủ Bang', elo: 1850, joinedAt: '30 ngày trước' },
    { id: '2', name: 'Shadow_Ninja', role: 'Phó Bang', elo: 1620, joinedAt: '14 ngày trước' },
    { id: '3', name: 'BẠN (Tập Sự)', role: 'Tập Sự', elo: 1000, joinedAt: 'Vừa gia nhập (Còn 10h thử việc)' },
  ];

  const handleLeaveGuild = () => {
    sounds.playWarning();
    if (confirm('Bạn có chắc muốn rời bang? Bạn sẽ bị phạt 24 GIỜ HỒI CHIÊU không thể xin vào bang khác!')) {
      setInGuild(false);
      setCooldownHours(24);
    }
  };

  const handleJoinGuild = () => {
    if (cooldownHours && cooldownHours > 0) {
      sounds.playWarning();
      alert(`Bạn đang trong thời gian phạt! Còn ${cooldownHours} giờ nữa mới được xin vào bang mới.`);
      return;
    }
    sounds.playClick();
    setInGuild(true);
    setCooldownHours(null);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Guild Header & RLS Security Notice */}
      <div className="tactical-panel" style={{
        padding: '24px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15), rgba(0, 242, 254, 0.08))',
        border: '1px solid rgba(157, 78, 221, 0.35)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9d4edd, #ff3366)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 0 20px rgba(157, 78, 221, 0.4)',
            }}>
              🐉
            </div>
            <div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--neon-purple)',
                letterSpacing: '1.5px',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
              }}>
                MULTI-TENANCY ROW-LEVEL SECURITY (RLS)
              </div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                color: 'var(--text-primary)',
                letterSpacing: '1px',
              }}>
                {inGuild ? 'BANG RỒNG ĐỎ (GUILD_DRAGON)' : 'NGƯỜI CHƠI TỰ DO (CHƯA VÀO BANG)'}
              </h2>
            </div>
          </div>

          <div>
            {inGuild ? (
              <button
                onClick={handleLeaveGuild}
                className="tactical-btn tactical-btn-hazard"
                style={{ padding: '8px 18px', fontSize: '0.8rem' }}
              >
                RỜI BANG (PHẠT 24H)
              </button>
            ) : (
              <button className="tactical-btn" onClick={handleJoinGuild}>
                XIN VÀO BANG RỒNG ĐỎ
              </button>
            )}
          </div>
        </div>

        {/* Cooldown & Probation Banners */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            padding: '14px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <span style={{ fontSize: '1.6rem' }}>⏳</span>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>
                QUY TẮC RỜI BANG (24H COOLDOWN)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {cooldownHours ? `Đang bị phạt: Còn ${cooldownHours}h nữa mới được vào bang mới` : 'Trạng thái: Bình thường, sẵn sàng chuyển bang'}
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            padding: '14px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <span style={{ fontSize: '1.6rem' }}>🛡️</span>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--neon-cyan)', fontFamily: 'var(--font-heading)' }}>
                QUY TẮC TẬP SỰ (12H PROBATION)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {inGuild ? 'Thành viên mới phải đủ 12 giờ mới được mở khóa rút quỹ vàng bang' : 'Chưa tham gia bang hội nào'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guild Stats & Members */}
      {inGuild ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Quỹ Vàng Bang */}
          <div className="tactical-panel" style={{ padding: '24px' }}>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '8px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '1px',
            }}>
              QUỸ VÀNG BANG HỘI
            </div>
            <div style={{
              fontSize: '2.4rem',
              fontFamily: 'var(--font-heading)',
              color: '#fbbf24',
              fontWeight: 900,
              marginBottom: '14px',
              textShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
            }}>
              🪙 50,000
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Dữ liệu ngân khố được cô lập bảo vệ bởi <code>Prisma Extension RLS</code>, chỉ tài khoản xác thực thuộc Bang Rồng Đỏ mới có thể truy xuất.
            </p>
            <button
              disabled
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-heading)',
                cursor: 'not-allowed',
              }}
            >
              🔒 RÚT QUỸ (MỞ KHÓA SAU 10H TẬP SỰ)
            </button>
          </div>

          {/* Danh Sách Thành Viên */}
          <div className="tactical-panel" style={{ padding: '24px' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '16px',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              letterSpacing: '1px',
            }}>
              DANH SÁCH THÀNH VIÊN ({members.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '1.4rem' }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.joinedAt}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      ⭐ {m.elo} ELO
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: m.role === 'Chủ Bang' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 242, 254, 0.1)',
                      color: m.role === 'Chủ Bang' ? '#fbbf24' : 'var(--neon-cyan)',
                      border: '1px solid currentColor',
                    }}>
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="tactical-panel" style={{
          textAlign: 'center',
          padding: '60px 24px',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛡️</div>
          <h3 style={{
            fontSize: '1.4rem',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            marginBottom: '10px',
          }}>
            Bạn chưa gia nhập bang hội nào!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Gia nhập bang hội để cùng đồng đội tích lũy ngân khố, kích hoạt đặc quyền RLS và tham gia chiến trường liên bang.
          </p>
          <button className="tactical-btn" onClick={handleJoinGuild}>
            GIA NHẬP BANG RỒNG ĐỎ NGAY
          </button>
        </div>
      )}
    </div>
  );
};
