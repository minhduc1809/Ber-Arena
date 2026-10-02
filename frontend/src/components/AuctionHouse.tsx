import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';

interface AuctionItem {
  id: string;
  title: string;
  rarity: 'Legendary' | 'Epic' | 'Rare';
  currentBid: number;
  highestBidder: string;
  timeLeft: number;
  version: number;
  icon: string;
}

interface AuctionHouseProps {
  goldBalance: number;
  onPlaceBid: (amount: number) => void;
}

export const AuctionHouse: React.FC<AuctionHouseProps> = ({ goldBalance, onPlaceBid }) => {
  const [items, setItems] = useState<AuctionItem[]>([
    {
      id: 'auc-1',
      title: 'Long Kiếm Hắc Ám',
      rarity: 'Legendary',
      currentBid: 350,
      highestBidder: 'dragon_slayer_99',
      timeLeft: 48,
      version: 4,
      icon: '🗡️',
    },
    {
      id: 'auc-2',
      title: 'Khiên Titan Bất Diệt',
      rarity: 'Epic',
      currentBid: 520,
      highestBidder: 'iron_wall_01',
      timeLeft: 124,
      version: 7,
      icon: '🛡️',
    },
    {
      id: 'auc-3',
      title: 'Sách Phép Cuồng Nộ',
      rarity: 'Rare',
      currentBid: 180,
      highestBidder: 'mystic_mage',
      timeLeft: 215,
      version: 2,
      icon: '📜',
    },
  ]);

  const handleBid = (itemId: string, step: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newBid = item.currentBid + step;
    if (goldBalance < newBid) {
      sounds.playWarning();
      alert('Số dư ví không đủ để tham gia đấu giá!');
      return;
    }

    sounds.playClick();
    // Mô phỏng Anti-sniping: nếu thời gian dưới 10s thì tự gia hạn thêm 30s
    const updatedTime = item.timeLeft < 10 ? item.timeLeft + 30 : item.timeLeft;

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              currentBid: newBid,
              highestBidder: 'BẠN (Commander)',
              version: i.version + 1,
              timeLeft: updatedTime,
            }
          : i
      )
    );

    onPlaceBid(step);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Banner Giới Thiệu Chợ Đấu Giá */}
      <div className="tactical-panel" style={{
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(157, 78, 221, 0.12))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--neon-gold)', fontSize: '1.2rem' }}>🏷️</span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              color: '#fbbf24',
              fontSize: '1.35rem',
              letterSpacing: '1px',
              fontWeight: 800,
            }}>
              SÀN ĐẤU GIÁ CONCURRENCY CHỐNG RACE CONDITION
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px', lineHeight: 1.6 }}>
            Hệ thống áp dụng <strong>Optimistic Locking (cột version)</strong>, <strong>Redis Distributed Lock</strong> và <strong>Idempotency Key</strong>. Khi bạn bị vượt giá (Outbid), 100% số vàng được hoàn trả nguyên tử vào ví ngay lập tức!
          </p>
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '10px',
          padding: '14px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#fef08a', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
            CHỐNG BẮN TỈA (ANTI-SNIPING)
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            Tự +30s nếu có bid ở &lt; 10s cuối
          </div>
        </div>
      </div>

      {/* Danh sách vật phẩm đấu giá */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="tactical-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Header Item */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: item.rarity === 'Legendary' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(157, 78, 221, 0.2)',
                  color: item.rarity === 'Legendary' ? '#fbbf24' : '#c084fc',
                  border: '1px solid currentColor',
                  letterSpacing: '1px',
                }}>
                  {item.rarity.toUpperCase()}
                </span>

                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: item.timeLeft < 30 ? 'var(--neon-red)' : 'var(--neon-cyan)',
                  fontFamily: 'var(--font-heading)',
                }}>
                  ⏳ CÒN {item.timeLeft}s
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{
                  fontSize: '2.5rem',
                  width: '68px',
                  height: '68px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0,0,0,0.5)',
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                  }}>
                    {item.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Optimistic Lock Version: <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>v{item.version}</span>
                  </div>
                </div>
              </div>

              {/* Bid Information */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Giá cao nhất:</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#fbbf24', fontSize: '1.2rem' }}>
                    🪙 {item.currentBid.toLocaleString()} Vàng
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Người giữ giá:</span>
                  <span style={{
                    color: item.highestBidder.includes('BẠN') ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                    fontWeight: 700,
                  }}>
                    {item.highestBidder}
                  </span>
                </div>
              </div>
            </div>

            {/* Bid Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="tactical-btn"
                onClick={() => handleBid(item.id, 20)}
                style={{ flex: 1, padding: '10px 0', fontSize: '0.8rem' }}
              >
                +20 VÀNG
              </button>
              <button
                className="tactical-btn"
                onClick={() => handleBid(item.id, 50)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(255, 51, 102, 0.3))',
                  borderColor: '#f59e0b',
                  color: '#fbbf24',
                }}
              >
                +50 VÀNG 🔥
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
