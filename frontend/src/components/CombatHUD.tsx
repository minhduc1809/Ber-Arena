import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';

interface CombatHUDProps {
  playerHp: number;
  opponentHp: number;
  turnTime: number;
  isPlayerTurn: boolean;
  playerName?: string;
  opponentName?: string;
  playerElo?: number;
  opponentElo?: number;
}

export const CombatHUD: React.FC<CombatHUDProps> = ({
  playerHp,
  opponentHp,
  turnTime,
  isPlayerTurn,
  playerName = 'COMMANDER',
  opponentName = 'SHADOW_BLADE',
  playerElo = 1250,
  opponentElo = 1280,
}) => {
  const [muted, setMuted] = useState(sounds.getMuted());

  const handleToggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sounds.playClick();
    }
  };

  const isLowTime = turnTime <= 5;
  const isPlayerCritical = playerHp <= 5;
  const isOpponentCritical = opponentHp <= 5;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '20px',
    }}>
      {/* OPPONENT PROFILE (CRIMSON HAZARD HUD) */}
      <div className={`tactical-panel ${isOpponentCritical ? 'tactical-panel-hazard' : ''}`} style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        animation: isOpponentCritical ? 'criticalPulse 2s infinite' : 'none',
      }}>
        {/* Opponent Avatar Frame */}
        <div style={{
          position: 'relative',
          width: '52px',
          height: '52px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.3), #1f0b12)',
          border: '2px solid var(--neon-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          boxShadow: '0 0 15px var(--neon-red-glow)',
        }}>
          👹
          <span style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-6px',
            background: 'var(--neon-red)',
            color: '#fff',
            fontSize: '0.6rem',
            fontFamily: 'var(--font-heading)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontWeight: 800,
          }}>
            AI
          </span>
        </div>

        {/* Name and Health Readout */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--neon-red)',
              letterSpacing: '1px',
            }}>
              {opponentName}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
              ⚡ {opponentElo} ELO
            </span>
          </div>

          {/* Segmented HP Gauge */}
          <div style={{
            height: '14px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 51, 102, 0.3)',
            position: 'relative',
          }}>
            <div style={{
              width: `${Math.max(0, Math.min(100, (opponentHp / 20) * 100))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff3366, #ff758c)',
              boxShadow: '0 0 10px rgba(255, 51, 102, 0.6)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            }}>
              {opponentHp} / 20 HP
            </span>
          </div>
        </div>
      </div>

      {/* CENTER TACTICAL TURN CLOCK */}
      <div className="tactical-panel" style={{
        padding: '12px 28px',
        textAlign: 'center',
        minWidth: '220px',
        border: isLowTime ? '2px solid var(--neon-red)' : '1px solid var(--border-tactical)',
        animation: isLowTime ? 'criticalPulse 1s infinite' : 'none',
      }}>
        {/* Phase Indicator */}
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.75rem',
          letterSpacing: '2px',
          fontWeight: 800,
          color: isPlayerTurn ? 'var(--neon-cyan)' : 'var(--neon-red)',
          textTransform: 'uppercase',
          marginBottom: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isPlayerTurn ? 'var(--neon-cyan)' : 'var(--neon-red)',
            boxShadow: isPlayerTurn ? '0 0 8px var(--neon-cyan)' : '0 0 8px var(--neon-red)',
          }} />
          {isPlayerTurn ? 'LƯỢT CỦA BẠN' : 'LƯỢT ĐỐI THỦ'}
        </div>

        {/* 30s Countdown Display */}
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.4rem',
          fontWeight: 900,
          lineHeight: 1,
          color: isLowTime ? 'var(--neon-red)' : 'var(--neon-cyan)',
          textShadow: isLowTime ? '0 0 20px var(--neon-red-glow)' : '0 0 15px var(--neon-cyan-glow)',
        }}>
          {turnTime.toString().padStart(2, '0')}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '2px' }}>s</span>
        </div>

        {/* Linear Progress Meter */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '6px',
        }}>
          <div style={{
            width: `${(turnTime / 30) * 100}%`,
            height: '100%',
            background: isLowTime ? 'var(--neon-red)' : 'var(--neon-cyan)',
            transition: 'width 1s linear',
          }} />
        </div>
      </div>

      {/* PLAYER PROFILE (CYAN CYBER COMMANDER) */}
      <div className={`tactical-panel ${isPlayerCritical ? 'tactical-panel-hazard' : ''}`} style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexDirection: 'row-reverse',
        animation: isPlayerCritical ? 'criticalPulse 2s infinite' : 'none',
      }}>
        {/* Commander Avatar Frame */}
        <div style={{
          position: 'relative',
          width: '52px',
          height: '52px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.3), #09172e)',
          border: '2px solid var(--neon-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          boxShadow: '0 0 15px var(--neon-cyan-glow)',
        }}>
          🧙‍♂️
          <span style={{
            position: 'absolute',
            bottom: '-6px',
            left: '-6px',
            background: 'var(--neon-cyan)',
            color: '#000',
            fontSize: '0.6rem',
            fontFamily: 'var(--font-heading)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontWeight: 800,
          }}>
            YOU
          </span>
        </div>

        {/* Name and Health Readout */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', flexDirection: 'row-reverse' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--neon-cyan)',
              letterSpacing: '1px',
            }}>
              {playerName}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
              ⭐ {playerElo} ELO
            </span>
          </div>

          {/* Segmented HP Gauge */}
          <div style={{
            height: '14px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            position: 'relative',
          }}>
            <div style={{
              width: `${Math.max(0, Math.min(100, (playerHp / 20) * 100))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f2fe, #38bdf8)',
              boxShadow: '0 0 10px rgba(0, 242, 254, 0.6)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              marginLeft: 'auto',
            }} />
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            }}>
              {playerHp} / 20 HP
            </span>
          </div>
        </div>

        {/* Sound toggle button */}
        <button
          onClick={handleToggleSound}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 8px',
            cursor: 'pointer',
            color: muted ? 'var(--text-muted)' : 'var(--neon-cyan)',
            fontSize: '0.9rem',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
};
