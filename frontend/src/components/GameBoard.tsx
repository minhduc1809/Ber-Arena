import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CombatHUD } from './CombatHUD';
import { TacticalGrid } from './TacticalGrid';
import type { Unit, Card } from './TacticalGrid';
import { CommanderConsole } from './CommanderConsole';
import { sounds } from '../utils/soundEffects';

const INITIAL_DECK: Card[] = [
  { id: 'c1', name: 'Chiến Binh Thép', manaCost: 2, type: 'warrior', rarity: 'common', atk: 4, hp: 6, desc: 'Cận chiến, tiến công thẳng mỗi lượt', icon: '⚔️' },
  { id: 'c2', name: 'Xạ Thủ Tinh Anh', manaCost: 3, type: 'archer', rarity: 'rare', atk: 5, hp: 4, desc: 'Tầm xa, bắn xuyên hàng phòng thủ', icon: '🏹' },
  { id: 'c3', name: 'Hộ Vệ Thánh Điện', manaCost: 4, type: 'guardian', rarity: 'epic', atk: 2, hp: 12, desc: 'Khiên hộ thể, chặn đứng bước tiến quân địch', icon: '🛡️' },
  { id: 'c4', name: 'Hỏa Cầu Hủy Diệt', manaCost: 3, type: 'spell', rarity: 'rare', desc: 'Thiêu đốt mục tiêu, gây 5 sát thương tức thì', icon: '🔥' },
  { id: 'c5', name: 'Mưa Thiên Thạch', manaCost: 5, type: 'spell', rarity: 'epic', desc: 'Triệu hồi thiên thạch quét sạch 1 hàng quân địch', icon: '☄️' },
];

export const GameBoard: React.FC = () => {
  const ROWS = 5;
  const COLS = 4;

  // 1. Battle State
  const [grid, setGrid] = useState<(Unit | null)[][]>(() => {
    const initial = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    // Pre-populate an enemy guardian for tactical context
    initial[0][1] = {
      id: 'enemy-1',
      name: 'Hộ Vệ Bóng Đêm',
      type: 'guardian',
      atk: 2,
      hp: 10,
      maxHp: 10,
      owner: 'opponent',
    };
    return initial;
  });

  const [playerHp] = useState(20);
  const [opponentHp, setOpponentHp] = useState(20);
  const [playerMana, setPlayerMana] = useState(4);
  const [maxMana, setMaxMana] = useState(4);

  const [turnTime, setTurnTime] = useState(30);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [turnCount, setTurnCount] = useState(1);

  const [hand] = useState<Card[]>(INITIAL_DECK);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ r: number; c: number } | null>(null);

  const [combatLogs, setCombatLogs] = useState<string[]>([
    '⚔️ Trận chiến bắt đầu! Bàn cờ chiến thuật 4x5 đã sẵn sàng.',
    '⚡ Lượt 1: Chỉ huy nhận 4 Năng lượng khởi đầu.',
  ]);

  const [matchResult, setMatchResult] = useState<'victory' | 'defeat' | null>(null);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCombatLogs((prev) => [...prev, `[${time}] ${msg}`]);
  }, []);

  // Ref to always-current handleEndTurn to avoid stale closure in timer
  const handleEndTurnRef = useRef<() => void>(() => {});

  // 2. Turn Countdown 30s Timer
  useEffect(() => {
    if (matchResult) return;

    const timer = setInterval(() => {
      setTurnTime((prev) => {
        if (prev <= 1) {
          // Time expired -> switch turn via ref to avoid stale closure
          handleEndTurnRef.current();
          return 30;
        }
        if (prev <= 6 && isPlayerTurn) {
          sounds.playWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayerTurn, matchResult]);

  // 3. Victory & Defeat condition listener
  useEffect(() => {
    if (opponentHp <= 0 && !matchResult) {
      setMatchResult('victory');
      addLog('🏆 ĐỐI THỦ BỊ HẠ GỤC! BẠN ĐÃ CHIẾN THẮNG (+25 ELO)!');
    } else if (playerHp <= 0 && !matchResult) {
      setMatchResult('defeat');
      addLog('💀 TƯỚNG CỦA BẠN ĐÃ TỬ TRẬN! THẤT BẠI (-18 ELO)!');
    }
  }, [opponentHp, playerHp, matchResult, addLog]);

  // 4. Keyboard Hotkeys ([1-5] card select, [Space] end turn, [Esc] cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchResult) return;

      if (e.key >= '1' && e.key <= '5') {
        const cardIndex = parseInt(e.key, 10) - 1;
        if (hand[cardIndex]) {
          const card = hand[cardIndex];
          if (playerMana >= card.manaCost) {
            sounds.playClick();
            setSelectedCard((curr) => (curr?.id === card.id ? null : card));
          } else {
            sounds.playWarning();
          }
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (isPlayerTurn) {
          handleEndTurn();
        }
      } else if (e.key === 'Escape') {
        setSelectedCard(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hand, playerMana, isPlayerTurn, matchResult]);

  // 5. Handle Tile Interaction (Card Summon or Spell Target)
  const handleTileClick = (r: number, c: number) => {
    if (!selectedCard || !isPlayerTurn || matchResult) return;

    if (playerMana < selectedCard.manaCost) {
      sounds.playWarning();
      addLog(`⚠️ Không đủ Mana để dùng ${selectedCard.name}!`);
      return;
    }

    // A. Spell Action (Hỏa Cầu / Thiên Thạch)
    if (selectedCard.type === 'spell') {
      sounds.playSpell();
      setPlayerMana((m) => m - selectedCard.manaCost);

      if (selectedCard.id === 'c4') {
        // Hỏa Cầu: Gây 5 sát thương lên ô hoặc trừ trực tiếp HP tướng đối thủ nếu đánh hàng địch
        const newGrid = grid.map((row) => [...row]);
        const target = newGrid[r][c];

        if (target) {
          target.hp -= 5;
          target.damageTaken = 5;
          addLog(`🔥 Hỏa Cầu giáng đòn vào ${target.name} tại [${c},${r}] (-5 HP)!`);
          if (target.hp <= 0) {
            newGrid[r][c] = null;
            addLog(`💥 ${target.name} đã bị tiêu diệt!`);
          }
        } else {
          setOpponentHp((prev) => Math.max(0, prev - 5));
          addLog(`🔥 Hỏa Cầu bắn trúng cứ điểm ĐỐI THỦ (-5 HP)!`);
        }
        setGrid(newGrid);
      } else if (selectedCard.id === 'c5') {
        // Thiên Thạch: Quét sạch cả hàng r
        const newGrid = grid.map((row) => [...row]);
        let hitCount = 0;
        for (let col = 0; col < COLS; col++) {
          if (newGrid[r][col]) {
            newGrid[r][col]!.hp -= 6;
            newGrid[r][col]!.damageTaken = 6;
            hitCount++;
            if (newGrid[r][col]!.hp <= 0) {
              newGrid[r][col] = null;
            }
          }
        }
        setGrid(newGrid);
        addLog(`☄️ Thiên Thạch oanh tạc hàng ${r + 1}, trúng ${hitCount} mục tiêu!`);
      }

      setSelectedCard(null);
      return;
    }

    // B. Unit Summon (Chiến Binh, Cung Thủ, Hộ Vệ)
    // Server validation: Only rows 3 and 4 (player deployment territory)
    if (r < 3) {
      sounds.playWarning();
      addLog('❌ Chỉ được phép triệu hồi quân tại Sân Nhà (Hàng 4 & 5)!');
      return;
    }

    if (grid[r][c] !== null) {
      sounds.playWarning();
      addLog('❌ Vị trí này đã có đơn vị chiếm giữ!');
      return;
    }

    sounds.playDeploy();
    const newUnit: Unit = {
      id: `player-unit-${Date.now()}`,
      name: selectedCard.name,
      type: selectedCard.type as any,
      atk: selectedCard.atk || 3,
      hp: selectedCard.hp || 5,
      maxHp: selectedCard.hp || 5,
      owner: 'player',
    };

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = newUnit;
    setGrid(newGrid);
    setPlayerMana((m) => m - selectedCard.manaCost);
    addLog(`✨ Đã triệu hồi ${selectedCard.name} tại vị trí [${c},${r}] (-${selectedCard.manaCost} Mana).`);
    setSelectedCard(null);
  };

  // 6. End Turn & Server-Authoritative Simulation (Unit Advance & Clash)
  const handleEndTurn = useCallback(() => {
    if (!isPlayerTurn) return;

    sounds.playTurnChange(false);
    setIsPlayerTurn(false);
    setSelectedCard(null);
    setTurnTime(30);
    addLog('⌛ Kết thúc lượt. Bắt đầu giai đoạn giải quyết giao tranh!');

    // Simulate Unit movement and combat
    setTimeout(() => {
      setGrid((prevGrid) => {
        const nextGrid = prevGrid.map((row) => [...row]);

        // A. Friendly units advance upward (from row 4 -> 3 -> 2 -> 1 -> 0 -> Direct Attack)
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const unit = nextGrid[r][c];
            if (unit && unit.owner === 'player') {
              if (r === 0) {
                // Unit breaches enemy baseline -> direct hero damage!
                setOpponentHp((prev) => Math.max(0, prev - unit.atk));
                addLog(`⚡ ${unit.name} đột kích thành công, gây ${unit.atk} sát thương vào TƯỚNG ĐỊCH!`);
              } else if (nextGrid[r - 1][c] === null) {
                // Move forward 1 tile
                nextGrid[r - 1][c] = unit;
                nextGrid[r][c] = null;
              } else if (nextGrid[r - 1][c]?.owner === 'opponent') {
                // Clash with enemy unit!
                const enemy = nextGrid[r - 1][c]!;
                enemy.hp -= unit.atk;
                unit.hp -= enemy.atk;
                addLog(`⚔️ ${unit.name} giao tranh ác liệt với ${enemy.name}!`);
                if (enemy.hp <= 0) nextGrid[r - 1][c] = null;
                if (unit.hp <= 0) nextGrid[r][c] = null;
              }
            }
          }
        }

        // B. Opponent AI Action: Spawns an enemy warrior if row 0 has empty space
        const emptyCols = [0, 1, 2, 3].filter((c) => nextGrid[0][c] === null);
        if (emptyCols.length > 0 && Math.random() > 0.3) {
          const spawnCol = emptyCols[Math.floor(Math.random() * emptyCols.length)];
          nextGrid[0][spawnCol] = {
            id: `enemy-${Date.now()}`,
            name: 'Chiến Binh Bóng Tối',
            type: 'warrior',
            atk: 3,
            hp: 5,
            maxHp: 5,
            owner: 'opponent',
          };
          addLog(`👹 Đối thủ triệu hồi Chiến Binh Bóng Tối tại [${spawnCol},0]!`);
        }

        return nextGrid;
      });

      // Switch back to Player's turn
      setIsPlayerTurn(true);
      sounds.playTurnChange(true);
      setTurnCount((t) => t + 1);
      setMaxMana((m) => Math.min(10, m + 1));
      setPlayerMana((m) => Math.min(10, m + 1));
      setTurnTime(30);
      addLog(`▶️ Bắt đầu Lượt ${turnCount + 1}! Năng lượng được hồi phục.`);
    }, 1200);
  }, [isPlayerTurn, addLog, COLS, ROWS, turnCount]);

  // Keep handleEndTurnRef in sync so the timer closure always calls the latest version
  useEffect(() => {
    handleEndTurnRef.current = handleEndTurn;
  }, [handleEndTurn]);

  const handleRestartMatch = () => {
    sounds.playClick();
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setPlayerHp(20);
    setOpponentHp(20);
    setPlayerMana(4);
    setMaxMana(4);
    setTurnTime(30);
    setIsPlayerTurn(true);
    setTurnCount(1);
    setSelectedCard(null);
    setMatchResult(null);
    setCombatLogs(['⚔️ Trận chiến mới đã bắt đầu!']);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px', position: 'relative' }}>
      {/* 1. TOP COMBAT HUD */}
      <CombatHUD
        playerHp={playerHp}
        opponentHp={opponentHp}
        turnTime={turnTime}
        isPlayerTurn={isPlayerTurn}
      />

      {/* 2. MAIN TACTICAL WORKSPACE: 4x5 GRID (LEFT) + COMMANDER CONSOLE (RIGHT) */}
      <div style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
      }}>
        {/* Authoritative 4x5 Grid Board */}
        <TacticalGrid
          grid={grid}
          selectedCard={selectedCard}
          isPlayerTurn={isPlayerTurn}
          onTileClick={handleTileClick}
          hoveredTile={hoveredTile}
          setHoveredTile={setHoveredTile}
        />

        {/* Commander Deck Console */}
        <CommanderConsole
          hand={hand}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          playerMana={playerMana}
          maxMana={maxMana}
          isPlayerTurn={isPlayerTurn}
          onEndTurn={handleEndTurn}
          combatLogs={combatLogs}
        />
      </div>

      {/* 3. MATCH RESULT MODAL (VICTORY / DEFEAT) */}
      {matchResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 17, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="tactical-panel" style={{
            maxWidth: '460px',
            width: '90%',
            padding: '36px 30px',
            textAlign: 'center',
            border: matchResult === 'victory' ? '2px solid var(--neon-cyan)' : '2px solid var(--neon-red)',
            boxShadow: matchResult === 'victory' ? '0 0 40px var(--neon-cyan-glow)' : '0 0 40px var(--neon-red-glow)',
            animation: 'turnSlam 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>
              {matchResult === 'victory' ? '🏆' : '💀'}
            </div>

            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: '2px',
              color: matchResult === 'victory' ? 'var(--neon-cyan)' : 'var(--neon-red)',
              marginBottom: '12px',
            }}>
              {matchResult === 'victory' ? 'CHIẾN THẮNG QUANG VINH' : 'TƯỚNG QUÂN TỬ TRẬN'}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              {matchResult === 'victory'
                ? 'Bạn đã làm chủ bàn cờ 4x5 và triệt phá thành công căn cứ đối thủ! Nhận ngay +25 ELO và 150 Vàng thưởng.'
                : 'Căn cứ đã thất thủ trước sức tấn công áp đảo của đối thủ. Hãy xây dựng lại chiến thuật và tái đấu!'}
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-around',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>THỜI LƯỢNG</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#fff' }}>{turnCount} Lượt</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ELO RATING</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  color: matchResult === 'victory' ? '#4ade80' : '#ff3366',
                }}>
                  {matchResult === 'victory' ? '+25 ELO' : '-18 ELO'}
                </div>
              </div>
            </div>

            <button
              onClick={handleRestartMatch}
              className="tactical-btn"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              🔄 TÁI ĐẤU NGAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
