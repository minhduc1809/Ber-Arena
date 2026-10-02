import React, { useState } from 'react';
import type { Card } from './TacticalGrid';
import { sounds } from '../utils/soundEffects';

interface CommanderConsoleProps {
  hand: Card[];
  selectedCard: Card | null;
  onSelectCard: (card: Card | null) => void;
  playerMana: number;
  maxMana: number;
  isPlayerTurn: boolean;
  onEndTurn: () => void;
  combatLogs: string[];
}

export const CommanderConsole: React.FC<CommanderConsoleProps> = ({
  hand,
  selectedCard,
  onSelectCard,
  playerMana,
  maxMana,
  isPlayerTurn,
  onEndTurn,
  combatLogs,
}) => {
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  const previewManaCost = hoveredCard ? hoveredCard.manaCost : 0;

  return (
    <div style={{
      width: '380px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* 1. MANA BATTERY & ENERGY MATRIX */}
      <div className="tactical-panel" style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--neon-cyan)', fontSize: '1.1rem' }}>⚡</span>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '1px',
              color: 'var(--text-primary)',
            }}>
              NĂNG LƯỢNG (MANA)
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 900,
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan-glow)',
          }}>
            {playerMana}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{maxMana}</span>
          </div>
        </div>

        {/* 10 Segmented Mana Energy Cells with preview */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {Array.from({ length: 10 }).map((_, index) => {
            const isAvailable = index < playerMana;
            const isUnlocked = index < maxMana;
            const isPreviewCost = isAvailable && index >= (playerMana - previewManaCost);

            let cellBg = '#0b1120';
            let cellBorder = '1px solid rgba(255, 255, 255, 0.05)';
            let cellShadow = 'none';

            if (isPreviewCost) {
              cellBg = 'linear-gradient(180deg, #f59e0b, #d97706)';
              cellBorder = '1px solid #fbbf24';
              cellShadow = '0 0 8px rgba(245, 158, 11, 0.6)';
            } else if (isAvailable) {
              cellBg = 'linear-gradient(180deg, #00f2fe, #0284c7)';
              cellBorder = '1px solid var(--neon-cyan)';
              cellShadow = '0 0 8px var(--neon-cyan-glow)';
            } else if (isUnlocked) {
              cellBg = 'rgba(30, 41, 59, 0.6)';
              cellBorder = '1px solid rgba(255, 255, 255, 0.1)';
            }

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: '16px',
                  borderRadius: '3px',
                  background: cellBg,
                  border: cellBorder,
                  boxShadow: cellShadow,
                  transition: 'all 0.2s',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 2. TACTICAL CARD HAND (BOOM BOX) */}
      <div className="tactical-panel" style={{ padding: '18px 20px', flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '1px',
            color: 'var(--text-secondary)',
          }}>
            BỘ BÀI CHỈ HUY ({hand.length})
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            CHỌN ĐỂ TRIỆU HỒI
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {hand.map((card, idx) => {
            const isSelected = selectedCard?.id === card.id;
            const canAfford = playerMana >= card.manaCost;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (!canAfford) {
                    sounds.playWarning();
                    return;
                  }
                  sounds.playClick();
                  onSelectCard(isSelected ? null : card);
                }}
                onMouseEnter={() => {
                  setHoveredCard(card);
                  sounds.playHover();
                }}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(157, 78, 221, 0.2))'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected
                    ? '1px solid var(--neon-cyan)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.45,
                  transform: isSelected ? 'translateX(6px)' : 'none',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 242, 254, 0.3)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                }}
              >
                {/* Hotkey Hint [1..5] */}
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '6px',
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'var(--font-heading)',
                }}>
                  [{idx + 1}]
                </span>

                {/* Left Info: Icon & Labels */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: card.type === 'spell' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 242, 254, 0.12)',
                    border: card.type === 'spell' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(0, 242, 254, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}>
                    {card.icon}
                  </div>

                  <div>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: isSelected ? 'var(--neon-cyan)' : 'var(--text-primary)',
                    }}>
                      {card.name}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {card.desc}
                    </div>

                    {card.type !== 'spell' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '3px', fontSize: '0.7rem' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>⚔️ {card.atk}</span>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>❤️ {card.hp}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Mana Cost Gem */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: canAfford ? 'linear-gradient(135deg, #00f2fe, #0284c7)' : '#334155',
                  color: canAfford ? '#000' : 'var(--text-muted)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: canAfford ? '0 0 10px rgba(0, 242, 254, 0.5)' : 'none',
                  flexShrink: 0,
                }}>
                  {card.manaCost}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PRIMARY ACTION: END TURN CTA */}
      <button
        onClick={() => {
          if (!isPlayerTurn) return;
          sounds.playClick();
          onEndTurn();
        }}
        disabled={!isPlayerTurn}
        className={isPlayerTurn ? 'tactical-btn' : ''}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '1rem',
          fontWeight: 900,
          background: isPlayerTurn
            ? 'linear-gradient(135deg, #00f2fe, #9d4edd)'
            : 'rgba(30, 41, 59, 0.5)',
          color: isPlayerTurn ? '#000' : 'var(--text-muted)',
          border: isPlayerTurn ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
          cursor: isPlayerTurn ? 'pointer' : 'not-allowed',
          boxShadow: isPlayerTurn ? '0 0 25px var(--neon-cyan-glow)' : 'none',
        }}
      >
        {isPlayerTurn ? '⚔️ KẾT THÚC LƯỢT (PASS)' : '⏳ ĐỐI THỦ ĐANG TÁC CHIẾN...'}
      </button>

      {/* 4. CHRONOLOGICAL COMBAT TICKER / LOG */}
      <div className="tactical-panel" style={{ padding: '14px 18px', maxHeight: '150px', overflowY: 'auto' }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.75rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          marginBottom: '8px',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>📜</span> NHẬT KÝ CHIẾN TRƯỜNG
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {combatLogs.slice(-4).map((log, idx) => (
            <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
