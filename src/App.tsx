import React, { useState, useEffect, useRef } from 'react';

// --- GLOBALS & CONSTANTS ---
const COLORS = ['BLUE', 'RED', 'YELLOW', 'GREEN'];

const BOARD_LAYOUT = {
  BLUE: { base: [0, 0], start: 0, stretch: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]] },
  RED: { base: [9, 0], start: 13, stretch: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]] },
  GREEN: { base: [9, 9], start: 26, stretch: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]] },
  YELLOW: { base: [0, 9], start: 39, stretch: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]] }
};

const BOARD_CONFIG = BOARD_LAYOUT;

const PATH = [
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0], [7, 0], [8, 0],
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [14, 7], [14, 8],
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8], [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14], [7, 14], [6, 14],
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8], [0, 7], [0, 6]
];

const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

const DICE_SKINS = {
  DEFAULT: { id: 'DEFAULT', name: 'Standard', price: 0, face: '#ffffff', dot: '#000000' },
  GOLD: { id: 'GOLD', name: 'Gold King', price: 800, face: '#fbbf24', dot: '#78350f' },
  NEON: { id: 'NEON', name: 'Neon Glow', price: 1500, face: '#111', dot: '#22d3ee' }
};

const THEMES = {
  CLASSIC: { id: 'CLASSIC', name: 'Classic Board', price: 0, boardBg: '#ffffff', colors: { BLUE: '#1e40af', RED: '#b91c1c', YELLOW: '#a16207', GREEN: '#15803d' }, hexColors: { RED: '#b91c1c', GREEN: '#15803d', YELLOW: '#a16207', BLUE: '#1e40af' } },
  WOODEN: { id: 'WOODEN', name: 'Premium Wood', price: 1200, boardBg: '#fef3c7', colors: { BLUE: '#1d4ed8', RED: '#991b1b', YELLOW: '#92400e', GREEN: '#166534' }, hexColors: { RED: '#991b1b', GREEN: '#166534', YELLOW: '#92400e', BLUE: '#1d4ed8' } },
  MIDNIGHT: { id: 'MIDNIGHT', name: 'Midnight', price: 2500, boardBg: '#0f172a', colors: { BLUE: '#3b82f6', RED: '#ef4444', YELLOW: '#eab308', GREEN: '#22c55e' }, hexColors: { RED: '#ef4444', GREEN: '#22c55e', YELLOW: '#eab308', BLUE: '#3b82f6' } }
};

// --- ICON COMPONENTS ---
const SoundIcon = ({ on }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    {on ? (
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    ) : (
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    )}
  </svg>
);
const MusicIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>);
const GearIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.21-.07.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>);
const CoinIcon = () => (<div className="w-5 h-5 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full border border-yellow-100 flex items-center justify-center shadow-sm"><span className="text-[10px] font-bold text-yellow-900">$</span></div>);
const BagIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>);

// --- REUSABLE UI ---
const DiceFace = ({ value, isRolling, skinId = 'DEFAULT' }) => {
  const skin = DICE_SKINS[skinId] || DICE_SKINS.DEFAULT;
  const dots = { 1: [[50, 50]], 2: [[25, 25], [75, 75]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[25, 25], [75, 25], [25, 75], [75, 75]], 5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]], 6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]] };
  return (
    <div className={`w-full h-full ${isRolling ? 'animate-dice-spin' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md p-1">
        <rect width="90" height="90" x="5" y="5" rx="15" fill={skin.face} stroke="#ccc" strokeWidth="1" />
        {value && dots[value]?.map((pos, i) => <circle key={i} cx={pos[0]} cy={pos[1]} r="10" fill={skin.dot} />)}
      </svg>
    </div>
  );
};

const PinToken = ({ colorHex }) => (
  <svg viewBox="0 0 100 120" className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] w-5/6 h-5/6">
    <path d="M50 5 C20 5 5 30 5 55 C5 85 50 115 50 115 C50 115 95 85 95 55 C95 30 80 5 50 5 Z" fill={colorHex} stroke="rgba(255,255,255,0.8)" strokeWidth="4" />
    <circle cx="50" cy="45" r="16" fill="white" opacity="0.4" />
    <circle cx="50" cy="45" r="8" fill="white" />
  </svg>
);

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('SPLASH');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameMode, setGameMode] = useState('PVP'); 
  
  // Game Menu & Save State
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(!!localStorage.getItem('ludo_saved_game'));
  
  // Profile Stats
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('ludo_v28_profile');
    return saved ? JSON.parse(saved) : { name: 'Khiladi_8290', avatar: null, level: 1, xp: 0 };
  });

  // Shop & Coins
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('ludo_v28_shop');
    return saved ? JSON.parse(saved) : { coins: 1000, activeDice: 'DEFAULT', ownedDice: ['DEFAULT'], activeTheme: 'CLASSIC', ownedThemes: ['CLASSIC'] };
  });

  // Modals & States
  const [setupModal, setSetupModal] = useState({ isOpen: false, count: 2 });
  const [carromSetupModal, setCarromSetupModal] = useState({ isOpen: false, count: 2 });
  const [helpModal, setHelpModal] = useState({ isOpen: false, status: '' });
  const [nameModal, setNameModal] = useState({ isOpen: false, tempName: "" });
  const [paymentModal, setPaymentModal] = useState(false);
  const [storeTab, setStoreTab] = useState('BOARD');
  
  const [gameState, setGameState] = useState({ turn: 'BLUE', diceValue: 1, diceRolled: false, tokens: [], activePlayers: [], winner: null, message: "Game Started!" });

  const bgmRef = useRef(null);
  const musicInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // --- CARROM PHYSICS STATE ---
  const carromRef = useRef({
    striker: { id: 's', x: 50, y: 82, vx: 0, vy: 0, radius: 4, mass: 2, pocketed: false },
    coins: [], isAiming: false, aimStart: { x: 0, y: 0 }, aimCurrent: { x: 0, y: 0 },
    turn: 1, p1Score: 0, p2Score: 0, pocketedThisTurn: false, winner: null, winnerDeclared: false
  });
  const [carromRender, setCarromRender] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ludo_v28_profile', JSON.stringify(profile));
    localStorage.setItem('ludo_v28_shop', JSON.stringify(shop));
  }, [profile, shop]);

  useEffect(() => {
    if (view === 'SPLASH') setTimeout(() => setView('HOME'), 3000);
  }, [view]);

  // --- SAVE & RESUME LOGIC ---
  const saveGame = () => {
    localStorage.setItem('ludo_saved_game', JSON.stringify({ gameState, gameMode, setupModal }));
    setHasSavedGame(true);
    setIsGameMenuOpen(false);
    setView('HOME');
  };

  const resumeGame = () => {
    const saved = JSON.parse(localStorage.getItem('ludo_saved_game'));
    if (saved) {
      setGameState(saved.gameState);
      setGameMode(saved.gameMode);
      setSetupModal(saved.setupModal);
      setView('PLAYING');
    }
  };

  const quitGameWithoutSave = () => {
    setIsGameMenuOpen(false);
    setView('HOME');
  };

  // --- CARROM LOOP ---
  useEffect(() => {
    if (view === 'CARROM_PLAYING') {
      const loop = () => {
        let state = carromRef.current;
        if (state.winner) return;

        let moving = false;
        const entities = [state.striker, ...state.coins].filter(e => !e.pocketed);
        
        entities.forEach(e => {
          if (state.isAiming && e.id === 's') { e.vx = 0; e.vy = 0; } 
          else { e.x += e.vx; e.y += e.vy; }

          e.vx *= 0.985; e.vy *= 0.985;
          if (Math.abs(e.vx) < 0.05) e.vx = 0;
          if (Math.abs(e.vy) < 0.05) e.vy = 0;
          if (e.vx !== 0 || e.vy !== 0) moving = true;

          if (e.x < e.radius + 2) { e.x = e.radius + 2; e.vx = Math.abs(e.vx) * 0.8; }
          if (e.x > 98 - e.radius) { e.x = 98 - e.radius; e.vx = -Math.abs(e.vx) * 0.8; }
          if (e.y < e.radius + 2) { e.y = e.radius + 2; e.vy = Math.abs(e.vy) * 0.8; }
          if (e.y > 98 - e.radius) { e.y = 98 - e.radius; e.vy = -Math.abs(e.vy) * 0.8; }
          
          if ((e.x < 10 && e.y < 10) || (e.x > 90 && e.y < 10) || (e.x < 10 && e.y > 90) || (e.x > 90 && e.y > 90)) {
             if (e.id !== 's') {
               e.pocketed = true; e.vx = 0; e.vy = 0;
               state.pocketedThisTurn = true;
               if (state.turn === 1) state.p1Score++; else state.p2Score++;
             } else {
               e.vx = 0; e.vy = 0;
               state.pocketedThisTurn = false; 
               e.x = 50; e.y = state.turn === 1 ? 82 : 18;
             }
          }
        });

        for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
            let a = entities[i]; let b = entities[j];
            let dx = b.x - a.x; let dy = b.y - a.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            let minDist = a.radius + b.radius;
            if (dist < minDist && dist > 0) {
              let overlap = minDist - dist;
              let nx = dx / dist; let ny = dy / dist;
              a.x -= nx * (overlap * 0.5 + 0.1); a.y -= ny * (overlap * 0.5 + 0.1);
              b.x += nx * (overlap * 0.5 + 0.1); b.y += ny * (overlap * 0.5 + 0.1);
              let kx = a.vx - b.vx; let ky = a.vy - b.vy;
              let p = 2 * (nx * kx + ny * ky) / (a.mass + b.mass);
              a.vx -= p * b.mass * nx * 0.8; a.vy -= p * b.mass * ny * 0.8;
              b.vx += p * a.mass * nx * 0.8; b.vy += p * a.mass * ny * 0.8;
            }
          }
        }

        if (state.p1Score >= 5 || state.p2Score >= 5 || (state.p1Score + state.p2Score === 9)) {
           if (!state.winnerDeclared) {
               state.winnerDeclared = true;
               state.winner = state.p1Score > state.p2Score ? 'Player 1' : 'Player 2';
               setShop(s => ({ ...s, coins: s.coins + 200 }));
           }
        }

        if (!moving && !state.isAiming && !state.winner) {
           if (state.striker.vx === 0 && state.striker.vy === 0 && state.striker.y !== 82 && state.striker.y !== 18) {
               if (!state.pocketedThisTurn) state.turn = state.turn === 1 ? 2 : 1;
               state.striker.x = 50; state.striker.y = state.turn === 1 ? 82 : 18;
               state.pocketedThisTurn = false; moving = true; 
           }
        }
        if (moving || state.isAiming) setCarromRender(r => r + 1);
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [view]);

  const handleStrikerDown = (e) => {
     e.stopPropagation();
     const state = carromRef.current;
     if (state.striker.vx !== 0 || state.striker.vy !== 0) return;
     const touch = e.touches ? e.touches[0] : e;
     state.isAiming = true;
     state.aimStart = { x: touch.clientX, y: touch.clientY };
     state.aimCurrent = { x: touch.clientX, y: touch.clientY };
     setCarromRender(r => r + 1);
  };
  
  const handleBoardMove = (e) => {
     const state = carromRef.current;
     if (!state.isAiming) return;
     const touch = e.touches ? e.touches[0] : e;
     state.aimCurrent = { x: touch.clientX, y: touch.clientY };
     setCarromRender(r => r + 1);
  };

  const handleBoardUp = () => {
     const state = carromRef.current;
     if (!state.isAiming) return;
     state.isAiming = false;
     let dx = state.aimStart.x - state.aimCurrent.x;
     let dy = state.aimStart.y - state.aimCurrent.y;
     let dist = Math.sqrt(dx*dx + dy*dy);
     let maxDist = 150;
     if (dist > maxDist) { dx = (dx/dist)*maxDist; dy = (dy/dist)*maxDist; }
     if (dist > 10) { state.striker.vx = dx * 0.05; state.striker.vy = dy * 0.05; state.pocketedThisTurn = false; }
     setCarromRender(r => r + 1);
  };

  // --- LUDO LOGIC ---
  const addXP = (amt) => {
    setProfile(prev => {
      let nx = prev.xp + amt; let nl = prev.level;
      if (nx >= prev.level * 100) { nx -= prev.level * 100; nl++; }
      return { ...prev, xp: nx, level: nl };
    });
  };

  const handleRoll = () => {
    if (isRolling || gameState.diceRolled || gameState.winner || isAnimating) return;
    setIsRolling(true);
    if (soundEnabled) new Audio('https://actions.google.com/sounds/v1/foley/rolling_dice.ogg').play().catch(()=>{});
    
    let count = 0;
    const interval = setInterval(() => {
      setGameState(prev => ({ ...prev, diceValue: Math.floor(Math.random() * 6) + 1, message: "Dice Ghoom Raha Hai..." }));
      count++;
      if (count > 12) {
        clearInterval(interval);
        const val = Math.floor(Math.random() * 6) + 1;
        setGameState(prev => ({ ...prev, diceValue: val, diceRolled: true, message: `${prev.turn} Ne ${val} Roll Kiya!` }));
        setIsRolling(false);
        addXP(5);
      }
    }, 60);
  };

  const nextTurn = () => {
    setGameState(prev => {
      if (!prev.activePlayers || prev.activePlayers.length === 0) return prev;
      const idx = prev.activePlayers.indexOf(prev.turn);
      const next = prev.activePlayers[(idx + 1) % prev.activePlayers.length];
      return { ...prev, turn: next, diceRolled: false, diceValue: 1, message: `Ab ${next} ki baari hai!` };
    });
  };

  useEffect(() => {
    if (view === 'PLAYING' && gameState.diceRolled && !isRolling && !isAnimating && !gameState.winner) {
      const movable = gameState.tokens.filter(t => t.color === gameState.turn && ((t.state === 'home' && gameState.diceValue === 6) || (t.state === 'board' && t.position + gameState.diceValue <= 57)));
      if (movable.length === 0) {
        const timer = setTimeout(() => nextTurn(), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.diceRolled, isRolling, isAnimating, gameState.turn, gameState.diceValue, gameState.tokens, view, gameState.winner]);

  const moveToken = async (tid) => {
    if (!gameState.diceRolled || isRolling || gameState.winner || isAnimating) return;
    const tok = gameState.tokens.find(t => t.id === tid);
    if (!tok || tok.color !== gameState.turn) return;

    const v = gameState.diceValue;
    if (tok.state === 'home') {
      if (v === 6) { 
        setIsAnimating(true);
        setGameState(prev => ({ ...prev, tokens: prev.tokens.map(t => t.id === tid ? { ...t, state: 'board', position: 0 } : t) }));
        await new Promise(r => setTimeout(r, 300));
        finalizeMove(tid, v);
      }
      return;
    }
    if (tok.position + v > 57) return;

    setIsAnimating(true);
    let currentPos = tok.position;
    for (let i = 1; i <= v; i++) {
      currentPos++;
      setGameState(prev => ({ ...prev, tokens: prev.tokens.map(t => t.id === tid ? { ...t, position: t.position + 1 } : t) }));
      await new Promise(r => setTimeout(r, 250)); 
    }
    if (currentPos >= 57) addXP(50);
    finalizeMove(tid, v);
  };

  const finalizeMove = (tid, v) => {
    setGameState(prev => {
      let nts = [...prev.tokens];
      const upIndex = nts.findIndex(t => t.id === tid);
      let up = { ...nts[upIndex] };
      
      let captureMade = false;
      
      if (up.position >= 57) { up.state = 'finished'; up.position = 57; }
      nts[upIndex] = up;

      if (up.state === 'board' && up.position < 51) {
        const globalIdx = (up.position + BOARD_LAYOUT[up.color].start) % 52;
        if (!SAFE_SPOTS.includes(globalIdx)) {
          nts.forEach((t, i) => {
            if (t.color !== up.color && t.state === 'board' && t.position < 51) {
              const otherIdx = (t.position + BOARD_LAYOUT[t.color].start) % 52;
              if (otherIdx === globalIdx) {
                 nts[i] = { ...t, state: 'home', position: -1 };
                 captureMade = true;
              }
            }
          });
        }
      }

      const winCount = nts.filter(t => t.color === up.color && t.state === 'finished').length;
      if (winCount === 4 && !prev.winner) {
         setShop(s => ({ ...s, coins: s.coins + 200 }));
         localStorage.removeItem('ludo_saved_game'); 
         setHasSavedGame(false);
      }

      const tokenWon = up.state === 'finished';
      const getsAnotherTurn = v === 6 || captureMade || tokenWon;

      let nextTurnColor = prev.turn;
      if (winCount !== 4 && !getsAnotherTurn) {
        const idx = prev.activePlayers.indexOf(prev.turn);
        nextTurnColor = prev.activePlayers[(idx + 1) % prev.activePlayers.length];
      }

      let newMsg = `Ab ${nextTurnColor} ki baari hai!`;
      if (winCount === 4) newMsg = `🎉 ${up.color} JEET GAYA!`;
      else if (getsAnotherTurn) {
         if (captureMade) newMsg = `⚔️ Goti Kati! ${up.color} ko mila ek aur chance!`;
         else if (tokenWon) newMsg = `🏠 Goti Pass Hui! ${up.color} ko mila ek aur chance!`;
         else if (v === 6) newMsg = `🎲 6 Aaya! ${up.color} ki dobara baari!`;
      }

      setIsAnimating(false);
      return { ...prev, tokens: nts, diceRolled: false, winner: winCount === 4 ? up.color : prev.winner, turn: nextTurnColor, diceValue: 1, message: newMsg };
    });
  };

  const initGame = (mode) => {
    setGameMode(mode);
    let sel;
    if (mode === 'PVC') sel = ['BLUE', 'GREEN'];
    else {
      if (setupModal.count === 2) sel = ['BLUE', 'GREEN'];
      else if (setupModal.count === 3) sel = ['BLUE', 'RED', 'YELLOW'];
      else sel = ['BLUE', 'RED', 'YELLOW', 'GREEN'];
    }
    let ts = []; let id = 0;
    sel.forEach(c => { for(let i=0; i<4; i++) ts.push({ id: id++, color: c, state: 'home', position: -1 }); });
    setGameState({ turn: sel[0], diceValue: 1, diceRolled: false, tokens: ts, activePlayers: sel, winner: null, message: "Khel shuru! Roll karein." });
    setView('PLAYING'); setSetupModal({ ...setupModal, isOpen: false });
  };

  const initCarrom = () => {
    carromRef.current = {
      striker: { id: 's', x: 50, y: 82, vx: 0, vy: 0, radius: 4, mass: 2, pocketed: false },
      coins: [
         { id: 'q', type: 'queen', x: 50, y: 50, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'w1', type: 'white', x: 50, y: 43.5, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'w2', type: 'white', x: 43.5, y: 50, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'w3', type: 'white', x: 50, y: 56.5, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'w4', type: 'white', x: 56.5, y: 50, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'b1', type: 'black', x: 45.5, y: 45.5, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'b2', type: 'black', x: 54.5, y: 45.5, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'b3', type: 'black', x: 45.5, y: 54.5, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
         { id: 'b4', type: 'black', x: 54.5, y: 54.5, vx: 0, vy: 0, radius: 3, mass: 1, pocketed: false },
      ],
      isAiming: false, aimStart: { x: 0, y: 0 }, aimCurrent: { x: 0, y: 0 },
      turn: 1, p1Score: 0, p2Score: 0, pocketedThisTurn: false, winner: null, winnerDeclared: false
    };
    setCarromRender(r=>r+1); setView('CARROM_PLAYING'); setCarromSetupModal({ ...carromSetupModal, isOpen: false });
  };

  useEffect(() => {
    if (view === 'PLAYING' && gameMode === 'PVC' && gameState.turn === 'GREEN' && !gameState.winner && !isRolling && !isAnimating) {
      if (!gameState.diceRolled) {
        const timer = setTimeout(handleRoll, 1500);
        return () => clearTimeout(timer);
      } else {
        const movable = gameState.tokens.filter(t => t.color === 'GREEN' && ((t.state === 'home' && gameState.diceValue === 6) || (t.state === 'board' && t.position + gameState.diceValue <= 57)));
        if (movable.length > 0) {
          const timer = setTimeout(() => moveToken(movable[0].id), 1000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [gameState.turn, gameState.diceRolled, isRolling, isAnimating, view, gameMode, gameState.tokens, gameState.diceValue]);

  const handleAvatar = (e) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onloadend = () => setProfile(p => ({ ...p, avatar: r.result })); r.readAsDataURL(f); }
  };

  const handleMusic = (e) => {
    const f = e.target.files?.[0];
    if (f) { const u = URL.createObjectURL(f); if (bgmRef.current) bgmRef.current.pause(); bgmRef.current = new Audio(u); bgmRef.current.loop = true; bgmRef.current.play().then(() => setBgmPlaying(true)).catch(()=>{}); }
  };

  const toggleBgm = () => {
    if (bgmRef.current) { if (bgmPlaying) { bgmRef.current.pause(); setBgmPlaying(false); } else { bgmRef.current.play().catch(()=>{}); setBgmPlaying(true); } } else { musicInputRef.current?.click(); }
  };

  const buyItem = (type, item) => {
    if (shop.coins < item.price) return;
    if (type === 'DICE') setShop(s => ({ ...s, coins: s.coins - item.price, ownedDice: [...s.ownedDice, item.id], activeDice: item.id }));
    else setShop(s => ({ ...s, coins: s.coins - item.price, ownedThemes: [...s.ownedThemes, item.id], activeTheme: item.id }));
  };

  const currentTheme = THEMES[shop.activeTheme] || THEMES.CLASSIC;
  const cellPct = 100 / 15;

  const getTokenCoords = (t) => {
    if (t.state === 'home') {
      const b = BOARD_LAYOUT[t.color].base;
      return { x: b[0] + 1.5 + (t.id % 2) * 2, y: b[1] + 1.5 + Math.floor((t.id % 4) / 2) * 2 };
    }
    if (t.state === 'board' && t.position < 51) {
      const g = (t.position + BOARD_LAYOUT[t.color].start) % 52; 
      return { x: PATH[g][0], y: PATH[g][1] };
    }
    const s = t.position - 51;
    if (s >= 0 && s < 6) return { x: BOARD_LAYOUT[t.color].stretch[s][0], y: BOARD_LAYOUT[t.color].stretch[s][1] };
    return { x: 7, y: 7 };
  };

  const renderDice = (col) => {
    const active = gameState.activePlayers.includes(col);
    if (!active) return <div className="w-12 h-12"></div>;
    const turn = gameState.turn === col;
    const rollable = turn && !gameState.diceRolled && !isRolling && !isAnimating;
    return (
      <div className={`flex flex-col items-center transition-all ${turn ? 'scale-110 z-10' : 'opacity-40 grayscale'}`}>
        <button onClick={rollable ? handleRoll : undefined} className={`w-12 h-12 bg-white rounded-xl shadow-lg border-2 flex items-center justify-center ${rollable ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`} style={{ borderColor: currentTheme.colors[col] }}>
           <DiceFace value={turn || (gameState.turn === col && gameState.diceRolled) ? gameState.diceValue : 1} isRolling={turn && isRolling} skinId={shop.activeDice} />
        </button>
        <span className="text-[8px] font-black uppercase mt-1 drop-shadow-md text-white">{col}</span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen text-white font-sans select-none overflow-hidden cool-bg relative">
      <style>{`
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .cool-bg { background: linear-gradient(-45deg, #0f172a, #1e3a8a, #0f5298, #312e81); background-size: 400% 400%; animation: gradientBG 15s ease infinite; }
        .ludo-pattern { background-image: radial-gradient(circle at 100% 150%, rgba(28,111,181,0.5) 24%, rgba(24,98,163,0.5) 25%, rgba(24,98,163,0.5) 28%, rgba(28,111,181,0.5) 29%, rgba(28,111,181,0.5) 36%, rgba(24,98,163,0.5) 36%, rgba(24,98,163,0.5) 40%, transparent 40%); background-size: 80px 80px; } 
        .animate-dice-spin { animation: dSpin 0.1s linear infinite; } 
        @keyframes dSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } 
        .ludo-text-stroke { -webkit-text-stroke: 1.5px #1e40af; }
        .firework { position: absolute; width: 4px; height: 4px; border-radius: 50%; animation: fire 1.5s ease-out forwards; }
        @keyframes fire { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(25) translateY(-180px); opacity: 0; } }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; background: #3b82f6; border-radius: 50%; cursor: pointer; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
      
      <input type="file" accept="audio/*" ref={musicInputRef} onChange={handleMusic} className="hidden" />
      <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatar} className="hidden" />
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={() => setHelpModal({...helpModal, status: 'Verification is Pending'})} className="hidden" />

      {/* COOL SPLASH SCREEN */}
      {view === 'SPLASH' && (
        <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden ludo-pattern animate-pop-in">
           <div className="w-32 h-32 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.4)] flex flex-wrap p-3 gap-2 rotate-12 mb-8">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-[calc(50%-0.25rem)] h-[calc(50%-0.25rem)] rounded-full ${i===0?'bg-red-500':i===1?'bg-green-500':i===2?'bg-blue-500':'bg-yellow-400'}`}></div>
              ))}
           </div>
           <h1 className="text-6xl font-black italic ludo-text-stroke text-white uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tighter text-center">Ludo<br/>Master</h1>
        </div>
      )}

      {/* HOME */}
      {view === 'HOME' && (
        <div className="w-full h-screen ludo-pattern flex flex-col">
           <div className="w-full h-16 bg-gradient-to-b from-blue-600/80 to-blue-800/80 backdrop-blur-md border-b-2 border-yellow-500 flex justify-between items-center px-3 z-20 shadow-xl">
              <div className="flex items-center gap-2">
                 <div className="relative cursor-pointer" onClick={() => avatarInputRef.current.click()}>
                    <div className="w-10 h-10 border-2 border-yellow-400 rounded-lg bg-gray-200 flex items-center justify-center shadow-lg overflow-hidden">{profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <span className="text-xl">👤</span>}</div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-blue-900 border border-white text-[8px] font-black px-1 rounded-sm">{profile.level}</div>
                 </div>
                 <div className="text-left leading-tight">
                    <div className="flex items-center gap-1"><span className="font-black text-[10px] uppercase">{profile.name}</span><button onClick={() => setNameModal({isOpen: true, tempName: profile.name})} className="text-yellow-400 text-xs">✎</button></div>
                    <div className="w-20 h-1.5 bg-black/40 rounded-full border border-white/10 overflow-hidden"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(profile.xp / (profile.level * 100)) * 100}%` }}></div></div>
                 </div>
              </div>
              <div className="flex gap-3 items-center">
                 <button onClick={() => setSoundEnabled(!soundEnabled)}><SoundIcon on={soundEnabled} /></button>
                 <button onClick={toggleBgm} className={bgmPlaying ? 'text-green-400' : 'text-white'}><MusicIcon /></button>
                 <div className="bg-blue-900/60 border border-blue-400 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-inner"><CoinIcon /><span className="text-[10px] font-bold">{shop.coins}</span></div>
              </div>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4 z-10">
              <h1 className="text-6xl font-black italic ludo-text-stroke uppercase drop-shadow-2xl mb-2">LUDO MASTER</h1>
              
              {hasSavedGame && (
                 <button onClick={resumeGame} className="w-full max-w-sm h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black text-white shadow-[0_0_15px_rgba(79,70,229,0.6)] border-2 border-indigo-400 active:scale-95 transition-all animate-pulse tracking-widest text-lg">
                    ▶ RESUME GAME
                 </button>
              )}

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                 <button onClick={() => initGame('PVC')} className="bg-gradient-to-b from-blue-500 to-blue-700 border-4 border-yellow-500 rounded-2xl h-24 flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all"><span className="text-3xl mb-1">🖥️</span><span className="font-black text-[10px] uppercase">Vs Computer</span></button>
                 <button onClick={() => setSetupModal({ ...setupModal, isOpen: true })} className="bg-gradient-to-b from-blue-500 to-blue-700 border-4 border-yellow-500 rounded-2xl h-24 flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all"><span className="text-3xl mb-1">🙋‍♂️</span><span className="font-black text-[10px] uppercase tracking-tighter">Pass N Play</span></button>
              </div>
              <button onClick={() => setCarromSetupModal({ isOpen: true, count: 2 })} className="w-full max-w-sm h-16 bg-gradient-to-r from-green-600 to-green-800 border-4 border-green-400 rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all gap-4"><span className="text-3xl drop-shadow-md">🎱</span><span className="font-black text-lg text-white uppercase tracking-widest drop-shadow-md">Play Carrom</span></button>
              <button onClick={() => setView('STORE')} className="px-16 py-3 bg-yellow-500 text-blue-900 font-black rounded-full shadow-2xl uppercase tracking-widest active:scale-95">🛒 STORE</button>
           </div>
           <div className="h-16 bg-blue-900/80 backdrop-blur-md border-t-2 border-yellow-500 flex justify-around items-center z-20"><button onClick={() => setView('HOME')} className="w-14 h-14 bg-blue-600 border-2 border-white rounded-xl shadow-2xl flex items-center justify-center text-2xl -mt-8 active:scale-90 transition-all">🏠</button><button className="opacity-60 hover:opacity-100 transition-opacity" onClick={() => setHelpModal({isOpen: true, status: ''})}><GearIcon /></button></div>
        </div>
      )}

      {/* CARROM SETUP MODAL */}
      {carromSetupModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-green-800 border-4 border-yellow-500 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-pop-in">
              <h2 className="text-3xl font-black text-yellow-400 uppercase mb-8">Carrom Setup</h2>
              <div className="flex gap-4">
                 <button onClick={() => setCarromSetupModal({...carromSetupModal, isOpen: false})} className="flex-1 py-4 bg-red-600 rounded-xl font-black shadow-lg uppercase text-white">Cancel</button>
                 <button onClick={initCarrom} className="flex-1 py-4 bg-yellow-500 text-green-900 rounded-xl font-black shadow-lg uppercase">Start</button>
              </div>
           </div>
        </div>
      )}

      {/* CARROM PLAYING VIEW */}
      {view === 'CARROM_PLAYING' && (
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ludo-pattern" style={{ touchAction: 'none' }} onTouchMove={handleBoardMove} onTouchEnd={handleBoardUp} onMouseMove={handleBoardMove} onMouseUp={handleBoardUp} onMouseLeave={handleBoardUp}>
           <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
              <button onClick={() => setView('HOME')} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-2xl border border-white/20 active:scale-90 transition-all">←</button>
              <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/50 px-4 py-2 rounded-full text-yellow-400 font-black tracking-widest uppercase text-xs">P1: {carromRef.current.p1Score} | P2: {carromRef.current.p2Score}</div>
           </div>

           <div className="w-full max-w-md aspect-square bg-[#3e2723] border-[16px] border-[#2d1b15] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative flex items-center justify-center p-2">
              <div className="w-full h-full bg-[#f5deb3] rounded-lg relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]">
                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <circle cx="50%" cy="50%" r="14%" fill="none" stroke="#111" strokeWidth="2" opacity="0.4"/>
                    <circle cx="50%" cy="50%" r="13%" fill="none" stroke="#111" strokeWidth="1" opacity="0.4"/>
                    <circle cx="50%" cy="50%" r="3%" fill="#dc2626" opacity="0.8"/>
                    <circle cx="50%" cy="50%" r="4%" fill="none" stroke="#dc2626" strokeWidth="2"/>
                    <rect x="14%" y="14%" width="72%" height="72%" fill="none" stroke="#111" strokeWidth="1.5" opacity="0.5"/>
                    <rect x="18%" y="18%" width="64%" height="64%" fill="none" stroke="#111" strokeWidth="1.5" opacity="0.5"/>
                    <circle cx="16%" cy="16%" r="2%" fill="#dc2626" stroke="#111" strokeWidth="1" opacity="0.8"/>
                    <circle cx="84%" cy="16%" r="2%" fill="#dc2626" stroke="#111" strokeWidth="1" opacity="0.8"/>
                    <circle cx="16%" cy="84%" r="2%" fill="#dc2626" stroke="#111" strokeWidth="1" opacity="0.8"/>
                    <circle cx="84%" cy="84%" r="2%" fill="#dc2626" stroke="#111" strokeWidth="1" opacity="0.8"/>
                 </svg>

                 <div className="absolute top-1 left-1 w-[10%] h-[10%] bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)] border-2 border-[#8b4513]/40"></div>
                 <div className="absolute top-1 right-1 w-[10%] h-[10%] bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)] border-2 border-[#8b4513]/40"></div>
                 <div className="absolute bottom-1 left-1 w-[10%] h-[10%] bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)] border-2 border-[#8b4513]/40"></div>
                 <div className="absolute bottom-1 right-1 w-[10%] h-[10%] bg-[#0a0a0a] rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)] border-2 border-[#8b4513]/40"></div>

                 {carromRef.current.coins.filter(c => !c.pocketed).map(c => (
                   <div key={c.id} className="absolute rounded-full shadow-md flex items-center justify-center" style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.radius*2}%`, height: `${c.radius*2}%`, transform: 'translate(-50%, -50%)', backgroundColor: c.type==='queen'?'#dc2626':c.type==='white'?'#fdf5e6':'#1a1a1a', border: `1px solid ${c.type==='queen'?'#991b1b':c.type==='white'?'#d4b483':'#333'}` }}>
                        <div className="w-[60%] h-[60%] rounded-full border border-white/20"></div>
                   </div>
                 ))}
                 
                 <div className="absolute rounded-full shadow-lg border-2 border-[#3b82f6] bg-[#e2e8f0] flex items-center justify-center cursor-pointer z-10" 
                      style={{ left: `${carromRef.current.striker.x}%`, top: `${carromRef.current.striker.y}%`, width: `${carromRef.current.striker.radius*2}%`, height: `${carromRef.current.striker.radius*2}%`, transform: 'translate(-50%, -50%)' }}
                      onTouchStart={handleStrikerDown} onMouseDown={handleStrikerDown}
                  >
                    <div className="w-[50%] h-[50%] rounded-full border border-blue-400/50 pointer-events-none"></div>
                 </div>

                 {carromRef.current.isAiming && (
                   <div className="absolute bg-white/80 origin-bottom z-40 pointer-events-none" 
                        style={{ left: `${carromRef.current.striker.x}%`, top: `${carromRef.current.striker.y}%`, width: '4px', borderRadius: '2px', height: `${Math.min(150, Math.sqrt(Math.pow(carromRef.current.aimStart.x - carromRef.current.aimCurrent.x, 2) + Math.pow(carromRef.current.aimStart.y - carromRef.current.aimCurrent.y, 2)))}px`, transform: `translate(-50%, -100%) rotate(${Math.atan2(carromRef.current.aimStart.x - carromRef.current.aimCurrent.x, carromRef.current.aimCurrent.y - carromRef.current.aimStart.y)}rad)` }}>
                   </div>
                 )}
              </div>
           </div>

           <div className="mt-6 px-8 py-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
              <p className="font-black text-white uppercase tracking-widest">Player {carromRef.current.turn} Turn</p>
           </div>

           <div className="w-full max-w-md mt-4 px-4 z-20 pointer-events-auto">
               <input type="range" min="15" max="85" value={carromRef.current.striker.x} onChange={(e) => { if (carromRef.current.striker.vx === 0 && carromRef.current.striker.vy === 0) { carromRef.current.striker.x = parseFloat(e.target.value); setCarromRender(r=>r+1); } }} className="w-full appearance-none bg-white/20 h-2 rounded-full outline-none" style={{ WebkitAppearance: 'none' }} />
           </div>
        </div>
      )}

      {/* STORE SCREEN */}
      {view === 'STORE' && (
        <div className="w-full h-screen ludo-pattern flex flex-col">
           <div className="w-full h-14 bg-blue-800/80 backdrop-blur-md border-b-2 border-yellow-500 flex items-center px-4 justify-between z-20"><button onClick={() => setView('HOME')} className="font-black text-xl mr-4 active:scale-90">←</button><h2 className="font-black uppercase tracking-widest">Store</h2><div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full"><CoinIcon /><span className="font-bold text-yellow-400">{shop.coins}</span></div></div>
           <div className="flex bg-blue-900/80 border-b border-blue-400 z-10">{['BOARD', 'DICE', 'COIN'].map(tab => (<button key={tab} onClick={() => setStoreTab(tab)} className={`flex-1 py-3 font-black text-xs ${storeTab === tab ? 'bg-yellow-500 text-blue-900' : 'text-blue-200'}`}>{tab}</button>))}</div>
           <div className="flex-1 p-4 overflow-y-auto space-y-4 z-10">
              {storeTab === 'BOARD' && Object.values(THEMES).map(item => (<div key={item.id} className="bg-blue-800/90 backdrop-blur-md border-2 border-yellow-500/50 p-4 rounded-2xl flex justify-between items-center shadow-lg"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded border border-white/20" style={{ backgroundColor: item.boardBg }}></div><span className="font-black text-sm">{item.name}</span></div>{shop.ownedThemes.includes(item.id) ? <button onClick={() => setShop({...shop, activeTheme: item.id})} className={`px-4 py-2 rounded-lg font-black text-[10px] ${shop.activeTheme === item.id ? 'bg-green-600' : 'bg-blue-600'}`}>Equip</button> : <button onClick={() => buyItem('THEME', item)} className="bg-yellow-500 text-blue-900 px-6 py-2 rounded-lg font-black text-xs uppercase shadow-md">Buy {item.price}</button>}</div>))}
              {storeTab === 'DICE' && Object.values(DICE_SKINS).map(item => (<div key={item.id} className="bg-blue-800/90 backdrop-blur-md border-2 border-yellow-500/50 p-4 rounded-2xl flex justify-between items-center shadow-lg"><div className="flex items-center gap-3"><div className="w-12 h-12"><DiceFace value={6} skinId={item.id} /></div><span className="font-black">{item.name}</span></div>{shop.ownedDice.includes(item.id) ? <button onClick={() => setShop({...shop, activeDice: item.id})} className={`px-4 py-2 rounded-lg font-black text-[10px] ${shop.activeDice === item.id ? 'bg-green-600' : 'bg-blue-600'}`}>Equip</button> : <button onClick={() => buyItem('DICE', item)} className="bg-yellow-500 text-blue-900 px-6 py-2 rounded-lg font-black text-xs uppercase shadow-md">Buy {item.price}</button>}</div>))}
              {storeTab === 'COIN' && <div className="w-full bg-blue-900/80 border-2 border-yellow-400 p-6 rounded-3xl flex justify-between items-center shadow-xl"><div className="flex items-center gap-4"><CoinIcon /><span className="text-2xl font-black">2,000 Coins</span></div><button onClick={() => setPaymentModal(true)} className="bg-green-500 px-8 py-3 rounded-xl font-black text-white shadow-lg active:scale-95 uppercase">₹10</button></div>}
           </div>
        </div>
      )}

      {/* QR MODAL */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-3xl p-4 flex flex-col items-center shadow-2xl animate-pop-in">
              <img src="upi_1775709762922.png" alt="QR Code" className="w-full object-contain rounded-xl mb-4" />
              <button onClick={() => { setPaymentModal(false); setView('HOME'); }} className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl text-white font-black text-xl shadow-lg active:scale-95 uppercase transition-all">DONE</button>
           </div>
        </div>
      )}

      {/* NAME MODAL */}
      {nameModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4">
           <div className="bg-blue-900 border-4 border-yellow-400 w-full max-w-xs rounded-2xl p-6 text-center shadow-2xl animate-pop-in">
              <h3 className="text-yellow-400 font-black mb-4 uppercase">Naam Likhein</h3>
              <input type="text" value={nameModal.tempName} onChange={(e) => setNameModal({...nameModal, tempName: e.target.value})} className="w-full bg-white text-blue-950 p-3 rounded-lg font-bold outline-none mb-4" maxLength={12} />
              <div className="flex gap-2">
                 <button onClick={() => setNameModal({isOpen: false, tempName: ""})} className="flex-1 py-3 bg-red-600 rounded-xl font-black">RADD</button>
                 <button onClick={() => { setProfile({...profile, name: nameModal.tempName}); setNameModal({isOpen: false, tempName: ""}); }} className="flex-1 py-3 bg-green-500 rounded-xl font-black uppercase">Save</button>
              </div>
           </div>
        </div>
      )}

      {/* HELP MODAL */}
      {helpModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
           <div className="bg-blue-800 border-4 border-yellow-400 w-full max-w-xs rounded-2xl p-8 text-center shadow-2xl animate-pop-in">
              <h2 className="text-yellow-400 font-black text-xl mb-6 uppercase">Help Center</h2>
              <button onClick={() => galleryInputRef.current?.click()} className="w-full py-4 bg-blue-600 rounded-xl font-bold mb-4 shadow-lg active:scale-95 uppercase text-white">Submit Verification</button>
              {helpModal.status && <p className="text-yellow-200 font-black animate-pulse mb-4 tracking-tighter">{helpModal.status}</p>}
              <button onClick={() => setHelpModal({isOpen: false, status: ""})} className="mt-4 text-white underline font-bold uppercase">Back</button>
           </div>
        </div>
      )}

      {/* LUDO SETUP MODAL */}
      {setupModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-blue-800 border-4 border-yellow-500 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center animate-pop-in">
              <h2 className="text-3xl font-black text-yellow-400 uppercase mb-8">Setup</h2>
              <div className="flex justify-around mb-10">
                 {[2, 3, 4].map(n => (<button key={n} onClick={() => setSetupModal({...setupModal, count: n})} className={`w-14 h-14 rounded-2xl font-black text-xl shadow-lg transition-all ${setupModal.count === n ? 'bg-yellow-400 text-blue-900 scale-110' : 'bg-blue-900 opacity-60'}`}>{n}</button>))}
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setSetupModal({...setupModal, isOpen: false})} className="flex-1 py-4 bg-red-600 rounded-xl font-black shadow-lg uppercase">Cancel</button>
                 <button onClick={() => initGame(gameMode)} className="flex-1 py-4 bg-green-500 rounded-xl font-black shadow-lg uppercase">Start</button>
              </div>
           </div>
        </div>
      )}

      {/* GAME MENU MODAL (Save & Exit) */}
      {isGameMenuOpen && (
         <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-blue-900 border-4 border-yellow-400 p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl animate-pop-in">
               <h2 className="text-2xl font-black text-yellow-400 mb-6 uppercase tracking-widest">Menu</h2>
               <button onClick={saveGame} className="w-full py-4 mb-3 bg-green-500 rounded-xl font-black text-white shadow-lg active:scale-95 text-lg">💾 Save & Exit</button>
               <button onClick={quitGameWithoutSave} className="w-full py-4 mb-4 bg-red-500 rounded-xl font-black text-white shadow-lg active:scale-95 text-lg">🚪 Exit Without Save</button>
               <button onClick={() => setIsGameMenuOpen(false)} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white uppercase">Cancel</button>
            </div>
         </div>
      )}

      {/* LUDO PLAYING VIEW */}
      {view === 'PLAYING' && (
        <div className="w-full h-screen flex flex-col items-center justify-center p-2 relative overflow-hidden ludo-pattern">
           
           {/* Top Bar with Bag Icon and Message */}
           <div className="absolute top-4 w-full px-4 flex justify-between items-center z-20 pointer-events-auto">
              <button onClick={() => setIsGameMenuOpen(true)} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl border border-white/40 flex items-center justify-center shadow-lg active:scale-90 transition-all text-white">
                 <BagIcon />
              </button>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-bold text-xs shadow-lg flex-1 mx-4 text-center truncate">
                 {gameState.message}
              </div>
           </div>

           <div className="w-full max-w-lg flex justify-between items-end px-4 mb-4 z-10 mt-16">{renderDice('BLUE')}{renderDice('RED')}</div>
           
           <div className="relative w-full max-w-lg aspect-square border-[8px] rounded-2xl shadow-2xl overflow-hidden z-10" style={{ backgroundColor: currentTheme.boardBg, borderColor: currentTheme.colors.BLUE }}>
              
              {/* Bases */}
              {COLORS.map(col => (
                <div key={col} className="absolute border-[6px]" style={{ left: `${BOARD_LAYOUT[col].base[0]*cellPct}%`, top: `${BOARD_LAYOUT[col].base[1]*cellPct}%`, width: `${cellPct*6}%`, height: `${cellPct*6}%`, backgroundColor: currentTheme.colors[col], borderColor: currentTheme.boardBg }}>
                   <div className="w-full h-full p-4">
                      <div className="w-full h-full bg-white/95 rounded-2xl shadow-[inset_0_0_15px_rgba(0,0,0,0.4)] flex flex-wrap justify-center content-center gap-3">
                         {[0,1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]" style={{ borderColor: currentTheme.colors[col], backgroundColor: `${currentTheme.colors[col]}20` }}></div>
                         ))}
                      </div>
                   </div>
                </div>
              ))}
              
              {/* Path Grid */}
              {PATH.map((c, i) => (
                <div key={i} className="absolute border-[0.5px] shadow-[inset_0_0_2px_rgba(0,0,0,0.1)]" style={{ left: `${c[0]*cellPct}%`, top: `${c[1]*cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%`, backgroundColor: currentTheme.boardBg, borderColor: '#cbd5e1' }}>
                   {SAFE_SPOTS.includes(i) && <div className="w-full h-full flex items-center justify-center text-gray-400 text-[14px]">★</div>}
                </div>
              ))}
              
              {/* Home Stretch */}
              {COLORS.map(col => BOARD_LAYOUT[col].stretch.map((pos, idx) => (
                <div key={`${col}-${idx}`} className="absolute border-[0.5px] border-black/20" style={{ left: `${pos[0]*cellPct}%`, top: `${pos[1]*cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%`, backgroundColor: currentTheme.colors[col] }}></div>
              )))}
              
              {/* Center Triangles */}
              <div className="absolute inset-[40%] z-10 bg-white border border-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
                 <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="0,0 100,0 50,50" fill={currentTheme.hexColors.RED} />
                    <polygon points="100,0 100,100 50,50" fill={currentTheme.hexColors.GREEN} />
                    <polygon points="0,100 100,100 50,50" fill={currentTheme.hexColors.YELLOW} />
                    <polygon points="0,0 0,100 50,50" fill={currentTheme.hexColors.BLUE} />
                    <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                    <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                 </svg>
              </div>

              {/* Tokens with Animation */}
              {gameState.tokens.map(t => {
                const coords = getTokenCoords(t);
                return (
                  <div key={t.id} onClick={() => moveToken(t.id)} className="absolute z-30 flex items-center justify-center transition-all duration-200 cursor-pointer" style={{ width: `${cellPct}%`, height: `${cellPct}%`, left: `${coords.x*cellPct}%`, top: `${coords.y*cellPct}%` }}>
                     <PinToken colorHex={currentTheme.hexColors[t.color]} />
                  </div>
                );
              })}
           </div>

           <div className="w-full max-w-lg flex justify-between items-start px-4 mt-4 z-10">{renderDice('YELLOW')}{renderDice('GREEN')}</div>
        </div>
      )}

      {/* LUDO / CARROM WINNER MODAL */}
      {(gameState.winner || carromRef.current.winner) && (view === 'PLAYING' || view === 'CARROM_PLAYING') && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-6 text-center">
           {[...Array(40)].map((_, i) => <div key={i} className="firework" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, background: gameState.winner ? currentTheme.hexColors[gameState.winner] : '#facc15' }}></div>)}
           <h1 className="text-6xl font-black italic text-yellow-400 ludo-text-stroke uppercase mb-6 tracking-tighter">{gameState.winner ? 'LUDO MASTER' : 'CARROM MASTER'}</h1>
           <h2 className="text-4xl font-black text-white uppercase">{gameState.winner || carromRef.current.winner} IS THE WINNER! 🏆</h2>
           <p className="text-2xl font-bold text-green-400 mt-4 animate-bounce">+200 COINS WON</p>
           <button onClick={() => { setGameState({...gameState, winner: null}); carromRef.current.winner = null; setView('HOME'); }} className="mt-16 px-16 py-5 bg-green-500 rounded-full font-black text-2xl shadow-2xl uppercase active:scale-95 text-white">Home</button>
        </div>
      )}
    </div>
  );
}