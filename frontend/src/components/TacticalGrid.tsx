import React from 'react';

export interface Unit {
  id: string;
  name: string;
  type: 'warrior' | 'archer' | 'guardian';
  atk: number;
  hp: number;
  maxHp: number;
  owner: 'player' | 'opponent';
  animatingAttack?: boolean;
  damageTaken?: number | null;
}

export interface Card {
  id: string;
  name: string;
  manaCost: number;
  type: 'warrior' | 'archer' | 'guardian' | 'spell';
  rarity?: 'common' | 'rare' | 'epic';
  atk?: number;
  hp?: number;
  desc: string;
  icon: string;
}

interface TacticalGridProps {
  grid: (Unit | null)[][];
  selectedCard: Card | null;
  isPlayerTurn: boolean;
  onTileClick: (row: number, col: number) => void;
  hoveredTile: { r: number; c: number } | null;
  setHoveredTile: (tile: { r: number; c: number } | null) => void;
}

const COL_LABELS = ['A', 'B', 'C', 'D'];
const ROW_LABELS = ['1', '2', '3', '4', '5'];

export const TacticalGrid: React.FC<TacticalGridProps> = ({
  grid,
  selectedCard,
  isPlayerTurn,
  onTileClick,
  hoveredTile,
  setHoveredTile,
}) => {
  return (
    <div className="tactical-panel" style={{
      flex: 1,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
    }}>
      {/* Board Header & Coordinates */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem', color: 'var(--neon-cyan)' }}>⬡</span>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            letterSpacing: '2px',
            color: 'var(--text-primary)',
            fontWeight: 800,
          }}>
            CHIẾN TRƯỜNG LƯỚI TÁC CHIẾN 4x5
          </span>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '12px',
        }}>
          <span style={{ color: 'var(--neon-red)' }}>● Sân Địch (Hàng 1-2)</span>
          <span style={{ color: 'var(--neon-gold)' }}>▲ Trung Lộ (Hàng 3)</span>
          <span style={{ color: 'var(--neon-cyan)' }}>■ Sân Nhà (Hàng 4-5)</span>
        </div>
      </div>

      {/* Grid Column Labels A, B, C, D */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        textAlign: 'center',
        paddingLeft: '28px',
      }}>
        {COL_LABELS.map((col) => (
          <div
            key={col}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              letterSpacing: '1px',
            }}
          >
            CỘT {col}
          </div>
        ))}
      </div>

      {/* The 4 Columns x 5 Rows Grid Tiles */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {grid.map((row, r) => {
          const isEnemyZone = r < 2;
          const isNeutralZone = r === 2;
          const isPlayerDeployZone = r >= 3;

          return (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Row Label (1 to 5) */}
              <div style={{
                width: '16px',
                textAlign: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: isEnemyZone ? 'var(--neon-red)' : isNeutralZone ? 'var(--neon-gold)' : 'var(--neon-cyan)',
              }}>
                {ROW_LABELS[r]}
              </div>

              {/* 4 Tiles in Current Row */}
              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
              }}>
                {row.map((unit, c) => {
                  const isHovered = hoveredTile?.r === r && hoveredTile?.c === c;
                  const canDeployHere = isPlayerTurn && selectedCard && (
                    selectedCard.type === 'spell' ? true : isPlayerDeployZone && !unit
                  );

                  // Border & background based on zone & interaction state
                  let tileBg = 'rgba(15, 23, 42, 0.45)';
                  let tileBorder = '1px solid rgba(255, 255, 255, 0.06)';

                  if (unit) {
                    tileBg = unit.owner === 'player'
                      ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.12), rgba(8, 20, 36, 0.9))'
                      : 'linear-gradient(135deg, rgba(255, 51, 102, 0.15), rgba(30, 10, 18, 0.9))';
                    tileBorder = unit.owner === 'player'
                      ? '1px solid var(--border-tactical)'
                      : '1px solid var(--border-hazard)';
                  } else if (canDeployHere) {
                    tileBg = isHovered ? 'rgba(0, 242, 254, 0.2)' : 'rgba(0, 242, 254, 0.06)';
                    tileBorder = isHovered ? '2px solid var(--neon-cyan)' : '1px dashed var(--neon-cyan)';
                  } else if (isPlayerDeployZone) {
                    tileBg = 'rgba(0, 242, 254, 0.02)';
                    tileBorder = '1px solid rgba(0, 242, 254, 0.12)';
                  } else if (isEnemyZone) {
                    tileBg = 'rgba(255, 51, 102, 0.02)';
                    tileBorder = '1px solid rgba(255, 51, 102, 0.1)';
                  } else if (isNeutralZone) {
                    tileBg = 'rgba(245, 158, 11, 0.02)';
                    tileBorder = '1px solid rgba(245, 158, 11, 0.12)';
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => onTileClick(r, c)}
                      onMouseEnter={() => setHoveredTile({ r, c })}
                      onMouseLeave={() => setHoveredTile(null)}
                      style={{
                        height: '105px',
                        background: tileBg,
                        border: tileBorder,
                        borderRadius: '10px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: canDeployHere ? 'pointer' : 'default',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered && canDeployHere ? 'scale(1.03)' : 'scale(1)',
                        boxShadow: isHovered && canDeployHere ? '0 0 16px rgba(0, 242, 254, 0.3)' : 'none',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Coordinate Chip */}
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        left: '6px',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'rgba(255, 255, 255, 0.2)',
                        letterSpacing: '1px',
                      }}>
                        {COL_LABELS[c]}{ROW_LABELS[r]}
                      </span>

                      {/* Floating Damage Number */}
                      {unit?.damageTaken && (
                        <div className="damage-indicator" style={{ top: '10px' }}>
                          -{unit.damageTaken}
                        </div>
                      )}

                      {/* Unit Card Content */}
                      {unit ? (
                        <div style={{
                          textAlign: 'center',
                          width: '100%',
                          padding: '0 8px',
                          animation: 'floatGentle 4s infinite ease-in-out',
                        }}>
                          {/* Unit Role Icon */}
                          <div style={{ fontSize: '1.9rem', lineHeight: 1.1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))' }}>
                            {unit.type === 'warrior' ? '⚔️' : unit.type === 'archer' ? '🏹' : '🛡️'}
                          </div>

                          {/* Unit Name */}
                          <div style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            color: unit.owner === 'player' ? 'var(--neon-cyan)' : 'var(--neon-red)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {unit.name}
                          </div>

                          {/* Attack & HP Badges */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '4px',
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              color: '#fbbf24',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}>
                              ⚔️ {unit.atk}
                            </span>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              color: '#34d399',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}>
                              ❤️ {unit.hp}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Empty Tile Prompt */
                        canDeployHere && (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--neon-cyan)',
                          }}>
                            <span style={{ fontSize: '1.2rem', animation: 'cyanPulse 1.5s infinite' }}>+</span>
                            <span style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              letterSpacing: '1px',
                            }}>
                              {selectedCard?.type === 'spell' ? 'MỤC TIÊU' : 'TRIỆU HỒI'}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
