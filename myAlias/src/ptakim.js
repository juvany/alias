/* =====================================================
   PTAKIM — Multiplayer Party Game
   =====================================================
   All screens, state management, and game logic for
   the Ptakim (פתקים) game mode.
   ===================================================== */
import './ptakim.css';
import * as api from './ptakim-api.js';

/* =====================================================
   CONSTANTS
   ===================================================== */
const TURN_SECONDS = 60;
const PLAYER_COLORS = ['#6C63FF','#16a34a','#ea580c','#dc2626','#7c3aed','#0ea5e9','#d946ef','#f59e0b'];
// Gamified avatar icons - cool characters for players to choose
const PLAYER_AVATARS = [
  { id: 'ninja', icon: '🥷', name: 'Ninja' },
  { id: 'wizard', icon: '🧙', name: 'Wizard' },
  { id: 'alien', icon: '👽', name: 'Alien' },
  { id: 'robot', icon: '🤖', name: 'Robot' },
  { id: 'ghost', icon: '👻', name: 'Ghost' },
  { id: 'pirate', icon: '🏴‍☠️', name: 'Pirate' },
  { id: 'dragon', icon: '🐉', name: 'Dragon' },
  { id: 'unicorn', icon: '🦄', name: 'Unicorn' },
  { id: 'phoenix', icon: '🔥', name: 'Phoenix' },
  { id: 'crown', icon: '👑', name: 'Royal' },
  { id: 'star', icon: '⭐', name: 'Star' },
  { id: 'rocket', icon: '🚀', name: 'Rocket' },
  { id: 'diamond', icon: '💎', name: 'Diamond' },
  { id: 'lightning', icon: '⚡', name: 'Lightning' },
  { id: 'skull', icon: '💀', name: 'Skull' },
  { id: 'cat', icon: '🐱', name: 'Cat' },
  { id: 'wolf', icon: '🐺', name: 'Wolf' },
  { id: 'eagle', icon: '🦅', name: 'Eagle' },
  { id: 'panda', icon: '🐼', name: 'Panda' },
  { id: 'fox', icon: '🦊', name: 'Fox' },
];
const PLAYER_EMOJIS = PLAYER_AVATARS.map(a => a.icon);
const TEAM_PRESETS = [
  { name: 'A', color: '#6C63FF', emoji: '🟣' },
  { name: 'B', color: '#16a34a', emoji: '🟢' },
];
const CIRCUMFERENCE = 2 * Math.PI * 52;

/* =====================================================
   TRANSLATION STRINGS
   ===================================================== */
const PT = {
  he: {
    back: '← חזור',
    ptakimTitle: 'פתקים',
    ptakimSubtitle: 'כתבו שמות, נחשו ב-3 סיבובים!',
    createGame: 'צור/צרי משחק',
    joinGame: 'הצטרף/י למשחק',
    notesPerPlayer: 'פתקים לשחקן/ית',
    language: 'שפה',
    skipRule: 'דילוג',
    skipAllowed: 'מותר',
    skipNone: 'אסור',
    teamMode: 'קבוצות',
    teamAuto: 'אוטומטי',
    teamManual: 'ידני',
    createRoom: 'צור/צרי חדר',
    roomCode: 'קוד חדר',
    yourName: 'השם שלך',
    chooseAvatar: 'בחרו דמות',
    join: 'הצטרף/י',
    lobby: 'לובי',
    players: 'שחקנים',
    ready: 'מוכן/ה',
    waiting: 'ממתין/ה...',
    markReady: '✓ אני מוכן/ה',
    startGame: 'התחילו משחק!',
    forceStart: 'התחילו עכשיו',
    writeNotes: 'כתבו פתקים',
    notePlaceholder: 'כתבו שם...',
    submitNote: 'הבא →',
    submitNoteDone: 'סיום ✓',
    notesDone: 'כל הפתקים נשלחו!',
    waitingForOthers: 'ממתינים לשאר השחקנים/ות...',
    noteOf: 'פתק',
    of: 'מתוך',
    round: 'סיבוב',
    round1name: 'תיאור חופשי',
    round1desc: 'השתמשו בכמה מילים שתרצו כדי לתאר את השם בפתק.\nאסור לומר את השם עצמו!',
    round2name: 'מילה אחת',
    round2desc: 'מילה אחת בלבד לכל פתק.\nבחרו בחוכמה — אי אפשר לשנות!',
    round3name: 'פנטומימה',
    round3desc: 'אסור לדבר או להשמיע קול.\nרק תנועות גוף!',
    startRound: 'התחל/י סיבוב',
    holdToReveal: 'לחצו והחזיקו לחשיפה',
    correct: '✓ נכון!',
    skip: '↷ דלג/י',
    turnResults: 'תוצאות התור',
    guessed: 'נוחשו',
    skipped: 'דולגו',
    notes: 'פתקים',
    nextPlayer: 'השחקן/ית הבא/ה',
    roundResults: 'תוצאות הסיבוב',
    totalScore: 'ניקוד כולל',
    nextRound: 'סיבוב הבא →',
    gameOver: 'המשחק נגמר!',
    winner: 'הזוכים!',
    finalScores: 'ניקוד סופי',
    playAgain: 'משחק חדש',
    backToMenu: 'חזרה לתפריט',
    team: 'קבוצה',
    host: 'מארח/ת',
    you: 'את/ה',
    noSkipping: 'דילוג אסור במשחק זה',
    roundN: 'סיבוב',
    nowPlaying: 'משחק/ת עכשיו',
    teamTurn: 'תור קבוצה',
    deckEmpty: 'כל הפתקים נוחשו!',
    r1short: 'ס1', r2short: 'ס2', r3short: 'ס3',
    total: 'סה"כ',
    enterRoomCode: 'הכניסו קוד חדר',
    enterName: 'הכניסו שם',
    invalidCode: 'קוד חדר לא תקין',
    roomNotFound: 'חדר לא נמצא',
    nameTaken: 'השם תפוס',
    copied: 'הועתק!',
    shareCode: 'שתפו את הקוד:',
    waitingForHost: 'ממתינים שהמארח/ת יתחיל/תתחיל...',
    shuffleTeams: '🔀 ערבבו קבוצות',
    joinNow: 'הצטרפו עכשיו!',
    waitingRoom: 'ממתינים לשחקנים/ות',
    gameStarted: 'המשחק כבר התחיל',
    goToLobby: 'המשך →',
    writingNotes: 'כותב/ת פתקים...',
    doneWriting: 'סיים/ה ✓',
    teamSetup: 'חלוקה לקבוצות',
    dragToTeam: 'הקישו על שחקן/ית להעברה לקבוצה',
    minTwoPerTeam: 'מינימום 2 שחקנים/ות בכל קבוצה',
    isPlaying: 'משחק/ת עכשיו',
    watchingPlayer: 'צפייה ב',
    yourTurn: 'התור שלך!',
    getReady: 'התכוננו!',
    itIsTurnOf: 'התור של',
    waitingToStart: 'ממתינים שיתחיל/תתחיל...',
    turnInProgress: 'משחק/ת עכשיו!',
    addTeam: '+ קבוצה',
    removeTeam: '- הסר',
    endGame: 'סיים משחק',
    endGameConfirm: 'בטוח/ה שברצונך לסיים את המשחק?',
    yes: 'כן',
    no: 'לא',
    gameEnded: 'המשחק הסתיים',
    timeUp: 'הזמן נגמר!',
    didTeamGuess: 'האם הקבוצה ניחשה את המילה האחרונה?',
    lastWord: 'מילה אחרונה',
    guessedIt: 'ניחשו! ✓',
    didNotGuess: 'לא ניחשו ✗',
    waitingForAnswer: 'ממתינים לתשובה...',
    viewOnlyTeamSetup: 'המארח/ת מחלק/ת קבוצות...',
    tapToAssign: 'הקישו על שחקן/ית להעברה',
    startTurn: '▶ התחל/י תור',
  },
  en: {
    back: '← Back',
    ptakimTitle: 'Ptakim',
    ptakimSubtitle: 'Write names, guess in 3 rounds!',
    createGame: 'Create Game',
    joinGame: 'Join Game',
    notesPerPlayer: 'Notes per player',
    language: 'Language',
    skipRule: 'Skipping',
    skipAllowed: 'Allowed',
    skipNone: 'Not allowed',
    teamMode: 'Teams',
    teamAuto: 'Automatic',
    teamManual: 'Manual',
    createRoom: 'Create Room',
    roomCode: 'Room Code',
    yourName: 'Your Name',
    chooseAvatar: 'Choose Avatar',
    join: 'Join',
    lobby: 'Lobby',
    players: 'Players',
    ready: 'Ready',
    waiting: 'Waiting...',
    markReady: '✓ I\'m Ready',
    startGame: 'Start Game!',
    forceStart: 'Start Now',
    writeNotes: 'Write Notes',
    notePlaceholder: 'Write a name...',
    submitNote: 'Next →',
    submitNoteDone: 'Done ✓',
    notesDone: 'All notes submitted!',
    waitingForOthers: 'Waiting for other players...',
    noteOf: 'Note',
    of: 'of',
    round: 'Round',
    round1name: 'Free Description',
    round1desc: 'Use as many words as you want to describe the name.\nDon\'t say the actual name!',
    round2name: 'One Word',
    round2desc: 'Only one word per note.\nChoose wisely — you can\'t change it!',
    round3name: 'Pantomime',
    round3desc: 'No speaking or sounds.\nGestures only!',
    startRound: 'Start Round',
    holdToReveal: 'Hold to reveal',
    correct: '✓ Correct!',
    skip: '↷ Skip',
    turnResults: 'Turn Results',
    guessed: 'Guessed',
    skipped: 'Skipped',
    notes: 'notes',
    nextPlayer: 'Next Player',
    roundResults: 'Round Results',
    totalScore: 'Total Score',
    nextRound: 'Next Round →',
    gameOver: 'Game Over!',
    winner: 'The Winners!',
    finalScores: 'Final Scores',
    playAgain: 'Play Again',
    backToMenu: 'Back to Menu',
    team: 'Team',
    host: 'Host',
    you: 'You',
    noSkipping: 'Skipping is not allowed',
    roundN: 'Round',
    nowPlaying: 'Now playing',
    teamTurn: 'Team turn',
    deckEmpty: 'All notes guessed!',
    r1short: 'R1', r2short: 'R2', r3short: 'R3',
    total: 'Total',
    enterRoomCode: 'Enter room code',
    enterName: 'Enter your name',
    invalidCode: 'Invalid room code',
    roomNotFound: 'Room not found',
    nameTaken: 'Name already taken',
    copied: 'Copied!',
    shareCode: 'Share the code:',
    waitingForHost: 'Waiting for the host to start...',
    shuffleTeams: '🔀 Shuffle Teams',
    joinNow: 'Join Now!',
    waitingRoom: 'Waiting for players',
    gameStarted: 'Game already started',
    goToLobby: 'Continue →',
    writingNotes: 'Writing notes...',
    doneWriting: 'Done ✓',
    teamSetup: 'Team Setup',
    dragToTeam: 'Drag players to teams',
    minTwoPerTeam: 'Minimum 2 players per team',
    isPlaying: 'is playing',
    watchingPlayer: 'Watching',
    yourTurn: 'Your turn!',
    getReady: 'Get ready!',
    itIsTurnOf: 'It\'s',
    waitingToStart: 'Waiting to start...',
    turnInProgress: 'Playing now!',
    addTeam: '+ Team',
    removeTeam: '- Remove',
    endGame: 'End Game',
    endGameConfirm: 'Are you sure you want to end the game?',
    yes: 'Yes',
    no: 'No',
    gameEnded: 'Game Ended',
    timeUp: 'Time\'s Up!',
    didTeamGuess: 'Did your team guess the last word?',
    lastWord: 'Last word',
    guessedIt: 'Guessed it! ✓',
    didNotGuess: 'Didn\'t guess ✗',
    waitingForAnswer: 'Waiting for answer...',
    viewOnlyTeamSetup: 'The host is setting up teams...',
    tapToAssign: 'Tap a player to assign',
    startTurn: '▶ Start Turn',
  },
  es: {
    back: '← Volver',
    ptakimTitle: 'Ptakim',
    ptakimSubtitle: 'Escribe nombres, adivina en 3 rondas!',
    createGame: 'Crear Juego',
    joinGame: 'Unirse',
    notesPerPlayer: 'Notas por jugador',
    language: 'Idioma',
    skipRule: 'Saltar',
    skipAllowed: 'Permitido',
    skipNone: 'No permitido',
    teamMode: 'Equipos',
    teamAuto: 'Automático',
    teamManual: 'Manual',
    createRoom: 'Crear Sala',
    roomCode: 'Código',
    yourName: 'Tu Nombre',
    chooseAvatar: 'Elige Avatar',
    join: 'Unirse',
    lobby: 'Sala',
    players: 'Jugadores',
    ready: 'Listo',
    waiting: 'Esperando...',
    markReady: '✓ Estoy listo',
    startGame: '¡Empezar!',
    forceStart: 'Empezar ya',
    writeNotes: 'Escribir Notas',
    notePlaceholder: 'Escribe un nombre...',
    submitNote: 'Siguiente →',
    submitNoteDone: 'Listo ✓',
    notesDone: '¡Todas las notas enviadas!',
    waitingForOthers: 'Esperando a los demás...',
    noteOf: 'Nota',
    of: 'de',
    round: 'Ronda',
    round1name: 'Descripción Libre',
    round1desc: 'Usa todas las palabras que quieras.\n¡No digas el nombre!',
    round2name: 'Una Palabra',
    round2desc: 'Solo una palabra por nota.\n¡Elige bien!',
    round3name: 'Pantomima',
    round3desc: 'Sin hablar ni sonidos.\n¡Solo gestos!',
    startRound: 'Empezar Ronda',
    holdToReveal: 'Mantén para ver',
    correct: '✓ ¡Correcto!',
    skip: '↷ Saltar',
    turnResults: 'Resultado del Turno',
    guessed: 'Adivinados',
    skipped: 'Saltados',
    notes: 'notas',
    nextPlayer: 'Siguiente Jugador',
    roundResults: 'Resultado de Ronda',
    totalScore: 'Puntaje Total',
    nextRound: 'Siguiente Ronda →',
    gameOver: '¡Fin del Juego!',
    winner: '¡Los Ganadores!',
    finalScores: 'Puntajes Finales',
    playAgain: 'Jugar de Nuevo',
    backToMenu: 'Volver al Menú',
    team: 'Equipo',
    host: 'Anfitrión',
    you: 'Tú',
    noSkipping: 'No se permite saltar',
    roundN: 'Ronda',
    nowPlaying: 'Jugando ahora',
    teamTurn: 'Turno de equipo',
    deckEmpty: '¡Todas las notas adivinadas!',
    r1short: 'R1', r2short: 'R2', r3short: 'R3',
    total: 'Total',
    enterRoomCode: 'Ingresa código de sala',
    enterName: 'Ingresa tu nombre',
    invalidCode: 'Código inválido',
    roomNotFound: 'Sala no encontrada',
    nameTaken: 'Nombre ya en uso',
    copied: '¡Copiado!',
    shareCode: 'Comparte el código:',
    waitingForHost: 'Esperando que el anfitrión inicie...',
    shuffleTeams: '🔀 Mezclar Equipos',
    joinNow: '¡Unirse ahora!',
    waitingRoom: 'Esperando jugadores',
    gameStarted: 'El juego ya empezó',
    goToLobby: 'Continuar →',
    writingNotes: 'Escribiendo notas...',
    doneWriting: 'Listo ✓',
    teamSetup: 'Configurar Equipos',
    dragToTeam: 'Arrastra jugadores a equipos',
    minTwoPerTeam: 'Mínimo 2 jugadores por equipo',
    isPlaying: 'está jugando',
    watchingPlayer: 'Viendo a',
    yourTurn: '¡Tu turno!',
    getReady: '¡Prepárate!',
    itIsTurnOf: 'Es el turno de',
    waitingToStart: 'Esperando que empiece...',
    turnInProgress: '¡Jugando ahora!',
    addTeam: '+ Equipo',
    removeTeam: '- Quitar',
    endGame: 'Terminar Juego',
    endGameConfirm: '¿Estás seguro de que quieres terminar el juego?',
    yes: 'Sí',
    no: 'No',
    gameEnded: 'Juego Terminado',
    timeUp: '¡Se acabó el tiempo!',
    didTeamGuess: '¿Tu equipo adivinó la última palabra?',
    lastWord: 'Última palabra',
    guessedIt: '¡Adivinado! ✓',
    didNotGuess: 'No adivinado ✗',
    waitingForAnswer: 'Esperando respuesta...',
    viewOnlyTeamSetup: 'El anfitrión está armando equipos...',
    tapToAssign: 'Toca un jugador para asignar',
    startTurn: '▶ Empezar Turno',
  }
};

function t(key) {
  const lang = (window.G && window.G.uiLang) || 'he';
  return (PT[lang] && PT[lang][key]) || (PT.en && PT.en[key]) || key;
}

/* =====================================================
   PTAKIM STATE
   ===================================================== */
let P = {
  screen: 'ptakimHome',
  // Player identity
  deviceId: localStorage.getItem('ptakim_device_id') || generateDeviceId(),
  playerName: localStorage.getItem('ptakim_player_name') || '',
  playerAvatar: localStorage.getItem('ptakim_player_avatar') || PLAYER_AVATARS[Math.floor(Math.random() * PLAYER_AVATARS.length)].icon,
  // Room
  roomCode: null,
  isHost: false,
  joined: false,  // true once player is actually in the room entity
  // Game settings (for host creating a room)
  settings: {
    notesPerPlayer: 5,
    language: 'he',
    skipAllowed: true,
    teamMode: 'auto', // 'auto' | 'manual'
  },
  // Room state (synced from server, or local mock)
  room: null,
  // Local state
  noteInputs: [],      // notes the local player has drafted
  notesSubmitted: 0,
  localTimer: null,
  timeLeft: 0,
  noteVisibility: 'hidden',  // 'auto' | 'hidden' | 'hold'
  autoRevealTimeout: null,
  turnCorrect: 0,
  turnSkipped: 0,
  clockOffset: 0,
  _currentNoteText: null,
};

function generateDeviceId() {
  const id = 'ptk_' + Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
  localStorage.setItem('ptakim_device_id', id);
  return id;
}

/* =====================================================
   STATE PERSISTENCE
   Save/restore game state to survive page refreshes
   ===================================================== */
const PTAKIM_STATE_KEY = 'ptakim_game_state';

function saveGameState() {
  // Only save if we're in an active game
  if (!P.roomCode) {
    localStorage.removeItem(PTAKIM_STATE_KEY);
    return;
  }
  const stateToSave = {
    screen: P.screen,
    roomCode: P.roomCode,
    isHost: P.isHost,
    joined: P.joined,
    settings: P.settings,
    room: P.room,
    noteInputs: P.noteInputs,
    notesSubmitted: P.notesSubmitted,
    turnCorrect: P.turnCorrect,
    turnSkipped: P.turnSkipped,
    timeLeft: P.timeLeft,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(PTAKIM_STATE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.warn('[Ptakim] Failed to save state:', e);
  }
}

function restoreGameState() {
  try {
    const saved = localStorage.getItem(PTAKIM_STATE_KEY);
    if (!saved) return false;
    const state = JSON.parse(saved);
    // Check if state is too old (more than 2 hours)
    if (Date.now() - state.savedAt > 2 * 60 * 60 * 1000) {
      localStorage.removeItem(PTAKIM_STATE_KEY);
      return false;
    }
    // Restore state
    P.screen = state.screen || 'ptakimHome';
    P.roomCode = state.roomCode;
    P.isHost = state.isHost;
    P.joined = state.joined;
    P.settings = state.settings || P.settings;
    P.room = state.room;
    P.noteInputs = state.noteInputs || [];
    P.notesSubmitted = state.notesSubmitted || 0;
    P.turnCorrect = state.turnCorrect || 0;
    P.turnSkipped = state.turnSkipped || 0;
    P.timeLeft = state.timeLeft || 0;
    console.log('[Ptakim] Restored game state, screen:', P.screen, 'room:', P.roomCode);
    return true;
  } catch (e) {
    console.warn('[Ptakim] Failed to restore state:', e);
    localStorage.removeItem(PTAKIM_STATE_KEY);
    return false;
  }
}

function clearGameState() {
  localStorage.removeItem(PTAKIM_STATE_KEY);
}

/* =====================================================
   MOCK ROOM (for local development / single-device testing)
   Will be replaced by Base44 API calls in Phase 3.
   ===================================================== */
/* =====================================================
   ROOM STATE NORMALIZATION
   Maps between Base44 server format (snake_case) and
   local format (camelCase) used by the UI.
   ===================================================== */
function normalizeRoom(raw) {
  if (!raw) return null;
  // If already in camelCase (mock mode), return as-is
  if (raw.roomCode !== undefined) return raw;
  // Convert from Base44 snake_case format
  return {
    id: raw.id,
    roomCode: raw.room_code,
    hostDeviceId: raw.host_device_id,
    phase: raw.phase,
    settings: raw.settings ? {
      notesPerPlayer: raw.settings.notes_per_player,
      skipAllowed: raw.settings.skip_allowed,
      teamMode: raw.settings.team_mode,
    } : P.settings,
    players: (raw.players || []).map(p => ({
      deviceId: p.device_id,
      name: p.name,
      ready: p.ready,
      notesSubmitted: p.notes_submitted,
      emoji: p.emoji,
    })),
    teams: (raw.teams || []).map(team => ({
      name: team.name,
      color: team.color,
      emoji: team.emoji,
      players: (team.player_device_ids || []).map(did => {
        const player = (raw.players || []).find(p => p.device_id === did);
        return player ? { deviceId: did, name: player.name, emoji: player.emoji } : { deviceId: did, name: did, emoji: '?' };
      }),
      playerDeviceIds: team.player_device_ids || [],
      explainerIdx: team.explainer_idx || 0,
      scores: team.scores || [0, 0, 0],
    })),
    notes: [],
    noteCount: raw.note_count || 0,
    currentRound: raw.current_round || 0,
    currentTurn: raw.current_turn ? {
      teamIdx: raw.current_turn.team_idx,
      playerIdx: raw.current_turn.player_idx,
      startTime: raw.current_turn.start_time ? new Date(raw.current_turn.start_time).getTime() : null,
      endTime: raw.current_turn.end_time ? new Date(raw.current_turn.end_time).getTime() : null,
    } : null,
    deck: raw.deck_order || [],
    deckIndex: raw.deck_index || 0,
    turnResults: raw.turn_results ? {
      teamIdx: raw.turn_results.team_idx,
      playerIdx: raw.turn_results.player_idx,
      correct: raw.turn_results.correct,
      skipped: raw.turn_results.skipped,
      deckEmpty: raw.turn_results.deck_empty,
    } : null,
  };
}

let _unsubscribe = null;

let _pollInterval = null;
let _lastRoomHash = null;

function roomHash(room) {
  if (!room) return '';
  return JSON.stringify({
    phase: room.phase,
    players: room.players,
    teams: room.teams,
    noteCount: room.noteCount,
    currentRound: room.currentRound,
    currentTurn: room.currentTurn,
    turnResults: room.turnResults,
    deckIndex: room.deckIndex,
  });
}

function applyRoomUpdate(raw, source) {
  if (!raw) return;

  // Check for game ended signal from server
  if (raw.phase === 'game_ended' || raw.phase === 'ended' || raw.phase === 'cancelled') {
    console.log('[Ptakim] Received game ended from server');
    forceEndGame();
    return;
  }

  const id = P.room?.id;
  const oldPhase = P.room?.phase;
  const oldTurnStartTime = P.room?.currentTurn?.startTime;
  const newRoom = normalizeRoom(raw);
  if (id) newRoom.id = id;
  else if (raw.id) newRoom.id = raw.id;

  const newHash = roomHash(newRoom);
  if (newHash === _lastRoomHash) return; // nothing changed, skip re-render
  _lastRoomHash = newHash;
  P.room = newRoom;
  saveGameState(); // Persist state for page refresh

  // Start local timer for spectators when turn starts (server has startTime)
  const newTurnStartTime = newRoom.currentTurn?.startTime;
  if (newTurnStartTime && newTurnStartTime !== oldTurnStartTime && newRoom.phase === 'turn_active') {
    // Turn just started - start local timer (uses server's endTime for sync)
    startLocalTimer(false); // Don't auto-end for spectators, only active player ends
  }

  if (window.G && window.G.screen.startsWith('ptakim')) {
    // Phase changed — navigate to the correct screen
    if (newRoom.phase !== oldPhase) {
      navigateByPhase();
    } else {
      ptkRender();
    }
  }
}

function subscribeToRoom() {
  if (!api.isOnline() || !P.roomCode) return;
  if (_unsubscribe) _unsubscribe();
  _lastRoomHash = roomHash(P.room);

  let subscriptionActive = false;

  // Try real-time subscription
  if (P.room && P.room.id) {
    _unsubscribe = api.subscribeToRoom(P.room.id, (data) => {
      subscriptionActive = true;
      applyRoomUpdate(data, 'sub');
    });
  }

  // Polling fallback — only polls if subscription hasn't fired recently
  clearInterval(_pollInterval);
  _pollInterval = setInterval(async () => {
    if (!P.roomCode || !api.isOnline()) { clearInterval(_pollInterval); return; }
    // If subscription is active and working, skip polling
    if (subscriptionActive) return;
    const raw = await api.getRoom(P.roomCode);
    if (raw) applyRoomUpdate(raw, 'poll');
  }, 3000);
}

/* =====================================================
   ROOM CREATION / JOINING
   ===================================================== */
async function createOnlineRoom() {
  const result = await api.createRoom(P.deviceId, P.playerName, P.settings);
  if (!result || !result.success) return false;
  P.roomCode = result.roomCode;
  P.isHost = true;
  P.joined = true;
  // Use room from create response directly (avoid re-fetch delay)
  P.room = normalizeRoom(result.room);
  if (P.room) P.room.id = result.roomId || result.room?.id;
  return true;
}

async function joinOnlineRoom(code) {
  const result = await api.joinRoom(code, P.deviceId, P.playerName);
  if (!result || !result.success) return { error: result?.error || 'failed' };
  P.roomCode = code;
  P.isHost = result.room.host_device_id === P.deviceId;
  P.room = normalizeRoom(result.room);
  if (P.room) P.room.id = result.roomId;
  subscribeToRoom();
  return { success: true };
}

function createMockRoom() {
  const code = generateRoomCode();
  P.roomCode = code;
  P.isHost = true;
  P.room = {
    roomCode: code,
    hostDeviceId: P.deviceId,
    phase: 'lobby',
    settings: { ...P.settings },
    players: [{
      deviceId: P.deviceId,
      name: P.playerName || defaultPlayerName(),
      ready: false,
      notesSubmitted: false,
      emoji: PLAYER_EMOJIS[0],
    }],
    teams: [],
    notes: [],
    noteCount: 0,
    currentRound: 0,
    currentTurn: null,
    deck: [],
    deckIndex: 0,
    turnResults: null,
  };
  P.playerName = P.room.players[0].name;
  localStorage.setItem('ptakim_player_name', P.playerName);
}

function joinMockRoom(code) {
  if (!P.room || P.room.roomCode !== code) {
    return false;
  }
  return true;
}

function addMockPlayer(name) {
  if (!P.room) return;
  const existing = P.room.players.find(p => p.name === name);
  if (existing) return;
  P.room.players.push({
    deviceId: 'mock_' + Math.random().toString(36).substr(2, 8),
    name: name,
    ready: false,
    notesSubmitted: false,
    emoji: PLAYER_EMOJIS[P.room.players.length % PLAYER_EMOJIS.length],
  });
}

/* =====================================================
   API ACTION WRAPPER
   Sends action to backend when online, or runs locally.
   ===================================================== */
async function doAction(action, data) {
  if (api.isOnline() && P.roomCode) {
    const beforeTime = Date.now();
    const result = await api.gameAction(P.roomCode, P.deviceId, action, data);
    if (result && result.server_time) {
      const serverNow = new Date(result.server_time).getTime();
      const rtt = Date.now() - beforeTime;
      P.clockOffset = serverNow - (beforeTime + rtt / 2);
    }
    if (result && result.room) {
      const id = P.room?.id;
      P.room = normalizeRoom(result.room);
      if (id) P.room.id = id;
    }
    return result;
  }
  return null;
}

function defaultPlayerName() {
  const lang = (window.G && window.G.uiLang) || 'he';
  if (lang === 'he') return 'שחקן 1';
  if (lang === 'es') return 'Jugador 1';
  return 'Player 1';
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/* =====================================================
   GAME LOGIC
   ===================================================== */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setupTeams() {
  if (!P.room) return;
  const players = [...P.room.players];
  const shuffled = shuffleArray(players);
  const teamA = [];
  const teamB = [];
  shuffled.forEach((p, i) => {
    if (i % 2 === 0) teamA.push(p);
    else teamB.push(p);
  });
  P.room.teams = [
    { name: t('team') + ' A', color: TEAM_PRESETS[0].color, emoji: TEAM_PRESETS[0].emoji, players: teamA, explainerIdx: 0, scores: [0, 0, 0] },
    { name: t('team') + ' B', color: TEAM_PRESETS[1].color, emoji: TEAM_PRESETS[1].emoji, players: teamB, explainerIdx: 0, scores: [0, 0, 0] },
  ];
}

function startRound(roundNum) {
  if (!P.room) return;
  P.room.currentRound = roundNum;
  // Shuffle all notes for this round
  const noteIndices = P.room.notes.map((_, i) => i);
  P.room.deck = shuffleArray(noteIndices);
  P.room.deckIndex = 0;
  // Reset turn
  P.room.currentTurn = null;
  P.room.phase = 'round_intro';
}

function startTurn() {
  if (!P.room) return;
  const turn = P.room.currentTurn;
  if (!turn) {
    // First turn of the round — start with team 0
    P.room.currentTurn = {
      teamIdx: 0,
      playerIdx: P.room.teams[0].explainerIdx,
      startTime: Date.now(),
      endTime: Date.now() + TURN_SECONDS * 1000,
    };
  } else if (!turn.startTime || !turn.endTime) {
    // Only set timestamps if server didn't provide them
    turn.startTime = Date.now();
    turn.endTime = Date.now() + TURN_SECONDS * 1000;
  }
  // Note: If turn.startTime and turn.endTime are already set from server, we keep those
  P.turnCorrect = 0;
  P.turnSkipped = 0;
  P.noteVisibility = 'hidden';
  P.room.phase = 'turn_active';
  startLocalTimer(true);
  showAutoReveal();
  ptkRender(); // Ensure UI updates after turn starts
}

function serverNow() {
  return Date.now() + (P.clockOffset || 0);
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    // Ding (high note)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 830;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.start(now);
    osc1.stop(now + 0.5);
    // Dong (low note)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 622;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.4, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.start(now + 0.3);
    osc2.stop(now + 0.9);
  } catch (_) {}
}

function startLocalTimer(autoEnd = false) {
  clearInterval(P.localTimer);

  const endTime = P.room?.currentTurn?.endTime;
  if (endTime) {
    P.timeLeft = Math.max(0, Math.ceil((endTime - serverNow()) / 1000));
  } else {
    P.timeLeft = TURN_SECONDS;
  }

  P.localTimer = setInterval(() => {
    if (!P.room || !P.room.currentTurn) return;
    const endTime = P.room.currentTurn.endTime;
    if (!endTime) return;

    const remaining = Math.max(0, Math.ceil((endTime - serverNow()) / 1000));
    P.timeLeft = remaining;

    const timerText = document.querySelector('.ptk-timer-text');
    const timerCircle = document.querySelector('.ptk-timer-circle circle:last-child');
    if (timerText) {
      timerText.textContent = remaining;
      const pct = remaining / TURN_SECONDS;
      timerText.style.color = pct < 0.25 ? '#dc2626' : pct < 0.5 ? '#ca8a04' : '#16a34a';
    }
    if (timerCircle) {
      const pct = remaining / TURN_SECONDS;
      timerCircle.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - pct)));
      timerCircle.setAttribute('stroke', pct < 0.25 ? '#dc2626' : pct < 0.5 ? '#ca8a04' : '#16a34a');
    }
    if (remaining <= 0) {
      clearInterval(P.localTimer);
      playBeep();
      if (autoEnd) {
        showTurnEndConfirm();
      }
    }
  }, 200);
}

function showAutoReveal() {
  P.noteVisibility = 'auto';
  clearTimeout(P.autoRevealTimeout);
  updateNoteOverlay();
  P.autoRevealTimeout = setTimeout(() => {
    if (P.noteVisibility === 'auto') {
      P.noteVisibility = 'hidden';
      updateNoteOverlay();
    }
  }, 2000);
}

function updateNoteOverlay() {
  const overlay = document.getElementById('ptk-note-overlay');
  if (!overlay) return;
  const visible = P.noteVisibility !== 'hidden';
  overlay.style.opacity = visible ? '0' : '1';
  overlay.style.pointerEvents = visible ? 'none' : 'auto';
}

function flashCard(type) {
  const card = document.getElementById('ptk-note-card');
  if (!card) return;
  card.classList.remove('flash-correct', 'flash-skip');
  void card.offsetWidth;
  card.classList.add(type === 'correct' ? 'flash-correct' : 'flash-skip');
}

function getCurrentNote() {
  if (!P.room) return null;
  // Check if deck is truly empty (all notes guessed this round)
  const deckSize = P.room.deck?.length || P.room.noteCount || 0;
  const deckIdx = P.room.deckIndex || 0;
  if (deckSize > 0 && deckIdx >= deckSize) return null; // Deck actually exhausted

  if (api.isOnline()) {
    // In online mode, note text comes from the API (cached in P._currentNoteText)
    // Return a loading state if we don't have the text yet but deck isn't empty
    if (P._currentNoteText) return { text: P._currentNoteText };
    // If deck has items but no text yet, return loading indicator
    if (deckSize > 0 && deckIdx < deckSize) return { text: '...', loading: true };
    return null;
  }
  const noteIdx = P.room.deck[P.room.deckIndex];
  return P.room.notes[noteIdx] || null;
}

function handleCorrect() {
  // Offline-only: online mode handles this inline in the button handler
  if (!P.room) return;
  P.turnCorrect++;
  P.room.deckIndex++;
  if (P.room.deckIndex >= P.room.deck.length) {
    endTurn(true);
    return;
  }
  P.noteVisibility = 'hidden';
  flashCard('correct');
  showAutoReveal();
  ptkRender();
}

function handleSkip() {
  // Offline-only: online mode handles this inline in the button handler
  if (!P.room || !P.room.settings.skipAllowed) return;
  P.turnSkipped++;
  const currentIdx = P.room.deck[P.room.deckIndex];
  P.room.deck.push(currentIdx);
  P.room.deckIndex++;
  if (P.room.deckIndex >= P.room.deck.length) {
    endTurn(true);
    return;
  }
  P.noteVisibility = 'hidden';
  flashCard('skip');
  showAutoReveal();
  ptkRender();
}

async function endTurn(deckEmpty, skipServerAction = false) {
  clearInterval(P.localTimer);
  clearTimeout(P.autoRevealTimeout);
  P.noteVisibility = 'hidden';
  P._currentNoteText = null;

  const turn = P.room.currentTurn;
  if (!turn) return;

  if (api.isOnline() && !skipServerAction) {
    await doAction('end_turn', {
      turnCorrect: P.turnCorrect,
      turnSkipped: P.turnSkipped,
    });
    // Server sets phase — navigateByPhase will handle screen transition
  } else if (!api.isOnline()) {
    // Offline mode: record score locally
    const roundIdx = P.room.currentRound - 1;
    P.room.teams[turn.teamIdx].scores[roundIdx] += P.turnCorrect;

    P.room.turnResults = {
      teamIdx: turn.teamIdx,
      playerIdx: turn.playerIdx,
      correct: P.turnCorrect,
      skipped: P.turnSkipped,
      deckEmpty: !!deckEmpty,
    };

    if (deckEmpty || P.room.deckIndex >= P.room.deck.length) {
      P.room.phase = 'round_result';
      ptkGoto('ptakimRoundResult');
    } else {
      P.room.phase = 'turn_result';
      ptkGoto('ptakimTurnResult');
    }
  }
}

function advanceToNextTurn() {
  if (!P.room || !P.room.currentTurn) return;
  const turn = P.room.currentTurn;
  // Advance to next team
  const nextTeamIdx = (turn.teamIdx + 1) % P.room.teams.length;
  const nextTeam = P.room.teams[nextTeamIdx];
  // Advance explainer within team
  if (nextTeamIdx <= turn.teamIdx) {
    // We've gone through all teams, advance explainer
    P.room.teams.forEach(team => {
      team.explainerIdx = (team.explainerIdx + 1) % team.players.length;
    });
  }
  P.room.currentTurn = {
    teamIdx: nextTeamIdx,
    playerIdx: nextTeam.explainerIdx,
    startTime: null,
    endTime: null,
  };
  P.turnCorrect = 0;
  P.turnSkipped = 0;
  P.room.phase = 'turn_active';
  // Don't start timer yet — wait for player to press start
  ptkRender();
}

function advanceToNextRound() {
  if (!P.room) return;
  const nextRound = P.room.currentRound + 1;
  if (nextRound > 3) {
    P.room.phase = 'game_finished';
    ptkRender();
    return;
  }
  startRound(nextRound);
  ptkRender();
}

function getTeamTotalScore(teamIdx) {
  if (!P.room || !P.room.teams[teamIdx]) return 0;
  return P.room.teams[teamIdx].scores.reduce((a, b) => a + b, 0);
}

function getWinnerTeamIdx() {
  if (!P.room) return 0;
  let maxScore = -1;
  let winnerIdx = 0;
  P.room.teams.forEach((team, i) => {
    const total = getTeamTotalScore(i);
    if (total > maxScore) {
      maxScore = total;
      winnerIdx = i;
    }
  });
  return winnerIdx;
}

/* =====================================================
   MULTIPLAYER NAVIGATION
   ===================================================== */
function isActivePlayer() {
  if (!P.room || !P.room.currentTurn || !P.room.teams) return false;
  const turn = P.room.currentTurn;
  const team = P.room.teams[turn.teamIdx];
  if (!team) return false;
  const playerDeviceId = team.playerDeviceIds?.[turn.playerIdx];
  return playerDeviceId === P.deviceId;
}

function navigateByPhase() {
  if (!P.room) return;
  const phase = P.room.phase;

  // Handle game ended - force cleanup on ALL devices
  if (phase === 'game_ended' || phase === 'ended' || phase === 'cancelled') {
    console.log('[Ptakim] Game ended by host, cleaning up...');
    forceEndGame();
    return;
  }

  const screenMap = {
    lobby: 'ptakimLobby',
    team_setup: 'ptakimTeamSetup',
    submitting_notes: 'ptakimNotes',
    round_intro: 'ptakimRoundIntro',
    turn_active: 'ptakimPlaying',
    turn_result: 'ptakimTurnResult',
    round_result: 'ptakimRoundResult',
    game_finished: 'ptakimFinal',
  };
  const target = screenMap[phase];
  if (!target) return;

  // When entering turn_active as spectator, start timer but don't auto-end
  if (phase === 'turn_active' && !isActivePlayer()) {
    if (P.room.currentTurn?.endTime) {
      startLocalTimer(false);
    }
  }

  if (P.screen !== target) {
    ptkGoto(target);
  }
}

/* =====================================================
   RENDER DISPATCHER
   ===================================================== */
function ptkRender() {
  const app = document.getElementById('app');
  if (!app) return;
  const screens = {
    ptakimHome: renderPtakimHome,
    ptakimCreate: renderPtakimCreate,
    ptakimJoin: renderPtakimJoin,
    ptakimLobby: renderPtakimLobby,
    ptakimTeamSetup: renderPtakimTeamSetup,
    ptakimNotes: renderPtakimNotes,
    ptakimRoundIntro: renderPtakimRoundIntro,
    ptakimPlaying: renderPtakimPlaying,
    ptakimTurnResult: renderPtakimTurnResult,
    ptakimRoundResult: renderPtakimRoundResult,
    ptakimFinal: renderPtakimFinal,
  };
  const fn = screens[P.screen];
  if (fn) fn(app);
}

function ptkGoto(screen) {
  P.screen = screen;
  // Save state for persistence across page refresh
  saveGameState();
  // Use the main render() for Ptakim screens registered globally
  if (window.G) {
    window.G.screen = screen;
    if (typeof window.render === 'function') {
      window.render();
      return;
    }
  }
  ptkRender();
}

/* =====================================================
   SCREEN: PTAKIM HOME
   ===================================================== */
function renderPtakimHome(app) {
  app.innerHTML = `
    <div class="ptk-screen">
      <div class="home-bg"></div>
      <div class="ptk-inner" style="justify-content:center;">
        <button class="btn-ghost" onclick="G.screen='modeSelect';render();" style="position:absolute;top:16px;${lang()==='he'?'right':'left'}:16px;z-index:1;">
          ${t('back')}
        </button>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:48px;">
          <div class="ptk-home-icon">📝</div>
          <div class="ptk-home-title">${t('ptakimTitle')}</div>
          <div class="ptk-home-desc">${t('ptakimSubtitle')}</div>
        </div>
        <div style="height:40px;"></div>
        <button class="btn btn-primary" id="ptk-create-btn">
          <span>🎲</span> ${t('createGame')}
        </button>
        <div style="height:10px;"></div>
        <button class="btn btn-secondary" id="ptk-join-btn">
          <span>🔗</span> ${t('joinGame')}
        </button>
      </div>
    </div>
  `;
  document.getElementById('ptk-create-btn').onclick = () => ptkGoto('ptakimCreate');
  document.getElementById('ptk-join-btn').onclick = () => ptkGoto('ptakimJoin');
}

/* =====================================================
   SCREEN: CREATE GAME
   ===================================================== */
function renderPtakimCreate(app) {
  const s = P.settings;
  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:center;">
        <button class="btn-ghost" id="ptk-create-back" style="position:absolute;top:16px;${lang()==='he'?'right':'left'}:16px;z-index:1;">
          ${t('back')}
        </button>

        <div style="text-align:center;margin-bottom:24px;">
          <div class="ptk-create-icon">🎲</div>
          <div style="font-size:1.5rem;font-weight:800;">${t('createGame')}</div>
        </div>

        <!-- Game Settings Card -->
        <div class="ptk-settings-card">
          <div class="ptk-settings-row">
            <span class="ptk-settings-label">📝 ${t('notesPerPlayer')}</span>
            <div class="ptk-chips-inline">
              ${[3,4,5,6,7].map(n => `
                <button class="ptk-chip-small ${s.notesPerPlayer===n?'active':''}" data-notes="${n}">${n}</button>
              `).join('')}
            </div>
          </div>
          <div class="ptk-settings-row">
            <span class="ptk-settings-label">↷ ${t('skipRule')}</span>
            <button class="ptk-toggle-small ${s.skipAllowed?'on':''}" id="ptk-skip-toggle">
              <span class="ptk-toggle-label">${s.skipAllowed ? t('skipAllowed') : t('skipNone')}</span>
            </button>
          </div>
        </div>

        <!-- Player Identity Card -->
        <div class="ptk-field" style="width:100%;">
          <label class="ptk-label">${t('yourName')}</label>
          <div class="ptk-identity-card">
            <div class="ptk-identity-avatar">
              <div class="ptk-selected-avatar">${P.playerAvatar}</div>
              <button class="ptk-change-avatar" id="ptk-change-avatar">✏️</button>
            </div>
            <input class="ptk-identity-name" id="ptk-host-name" value="${escHtml(P.playerName)}" placeholder="${t('enterName')}" maxlength="20">
          </div>
        </div>

        <!-- Avatar Picker (hidden by default) -->
        <div class="ptk-avatar-picker" id="ptk-avatar-picker" style="display:none;">
          <div class="ptk-avatar-grid-compact">
            ${PLAYER_AVATARS.map(a => `
              <button class="ptk-avatar-btn-small ${P.playerAvatar === a.icon ? 'selected' : ''}" data-avatar="${a.icon}">
                ${a.icon}
              </button>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-primary" id="ptk-create-room-btn" style="margin-top:24px;">
          ${t('createRoom')} →
        </button>
      </div>
    </div>
  `;

  document.getElementById('ptk-create-back').onclick = () => ptkGoto('ptakimHome');

  document.querySelectorAll('[data-notes]').forEach(btn => {
    btn.onclick = () => { s.notesPerPlayer = parseInt(btn.dataset.notes); ptkGoto('ptakimCreate'); };
  });

  document.getElementById('ptk-skip-toggle').onclick = () => {
    s.skipAllowed = !s.skipAllowed;
    ptkGoto('ptakimCreate');
  };

  // Avatar picker toggle
  const avatarPicker = document.getElementById('ptk-avatar-picker');
  document.getElementById('ptk-change-avatar').onclick = () => {
    avatarPicker.style.display = avatarPicker.style.display === 'none' ? 'block' : 'none';
  };

  // Avatar selection
  document.querySelectorAll('[data-avatar]').forEach(btn => {
    btn.onclick = () => {
      P.playerAvatar = btn.dataset.avatar;
      localStorage.setItem('ptakim_player_avatar', P.playerAvatar);
      ptkGoto('ptakimCreate');
    };
  });

  document.getElementById('ptk-create-room-btn').onclick = async () => {
    const nameInput = document.getElementById('ptk-host-name');
    P.playerName = (nameInput.value || '').trim() || defaultPlayerName();
    localStorage.setItem('ptakim_player_name', P.playerName);

    if (api.isOnline()) {
      const btn = document.getElementById('ptk-create-room-btn');
      if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
      const ok = await createOnlineRoom();
      if (!ok) {
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        return;
      }
    } else {
      createMockRoom();
      P.joined = true;
    }
    P.notesSubmitted = 0;
    P.noteInputs = [];
    ptkGoto('ptakimNotes');
  };
}

/* =====================================================
   SCREEN: JOIN GAME
   ===================================================== */
function renderPtakimJoin(app) {
  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:center;">
        <button class="btn-ghost" id="ptk-join-back" style="position:absolute;top:16px;${lang()==='he'?'right':'left'}:16px;z-index:1;">
          ${t('back')}
        </button>

        <div style="text-align:center;margin-bottom:24px;">
          <div class="ptk-create-icon">🔗</div>
          <div style="font-size:1.5rem;font-weight:800;">${t('joinGame')}</div>
        </div>

        <!-- Room Code Input -->
        <div class="ptk-code-input-wrap">
          <input class="ptk-code-input" id="ptk-join-code" placeholder="ABCD" maxlength="4"
            autocomplete="off" autocapitalize="characters">
        </div>

        <!-- Player Identity Card -->
        <div class="ptk-field" style="width:100%;">
          <label class="ptk-label">${t('yourName')}</label>
          <div class="ptk-identity-card">
            <div class="ptk-identity-avatar">
              <div class="ptk-selected-avatar">${P.playerAvatar}</div>
              <button class="ptk-change-avatar" id="ptk-change-avatar">✏️</button>
            </div>
            <input class="ptk-identity-name" id="ptk-join-name" value="${escHtml(P.playerName)}" placeholder="${t('enterName')}" maxlength="20">
          </div>
        </div>

        <!-- Avatar Picker (hidden by default) -->
        <div class="ptk-avatar-picker" id="ptk-avatar-picker" style="display:none;">
          <div class="ptk-avatar-grid-compact">
            ${PLAYER_AVATARS.map(a => `
              <button class="ptk-avatar-btn-small ${P.playerAvatar === a.icon ? 'selected' : ''}" data-avatar="${a.icon}">
                ${a.icon}
              </button>
            `).join('')}
          </div>
        </div>

        <div id="ptk-join-error" style="color:#dc2626;font-size:0.85rem;min-height:20px;margin-top:12px;"></div>

        <button class="btn btn-primary" id="ptk-join-submit" style="margin-top:8px;">
          ${t('join')} →
        </button>
      </div>
    </div>
  `;

  document.getElementById('ptk-join-back').onclick = () => ptkGoto('ptakimHome');

  // Avatar picker toggle
  const avatarPicker = document.getElementById('ptk-avatar-picker');
  document.getElementById('ptk-change-avatar').onclick = () => {
    avatarPicker.style.display = avatarPicker.style.display === 'none' ? 'block' : 'none';
  };

  // Avatar selection
  document.querySelectorAll('[data-avatar]').forEach(btn => {
    btn.onclick = () => {
      P.playerAvatar = btn.dataset.avatar;
      localStorage.setItem('ptakim_player_avatar', P.playerAvatar);
      ptkGoto('ptakimJoin');
    };
  });

  document.getElementById('ptk-join-submit').onclick = async () => {
    const code = (document.getElementById('ptk-join-code').value || '').trim().toUpperCase();
    const name = (document.getElementById('ptk-join-name').value || '').trim();
    const errorEl = document.getElementById('ptk-join-error');

    if (code.length !== 4) {
      errorEl.textContent = t('invalidCode');
      return;
    }
    if (!name) {
      errorEl.textContent = t('enterName');
      return;
    }

    P.playerName = name;
    localStorage.setItem('ptakim_player_name', name);

    if (api.isOnline()) {
      const btn = document.getElementById('ptk-join-submit');
      if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
      // Validate room exists and get settings (don't join yet)
      const raw = await api.getRoom(code);
      if (!raw) {
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        errorEl.textContent = t('roomNotFound');
        return;
      }
      if (raw.phase !== 'lobby') {
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        errorEl.textContent = t('gameStarted');
        return;
      }
      P.roomCode = code;
      P.room = normalizeRoom(raw);
      if (raw.id) P.room.id = raw.id;
      P.isHost = false;
      P.joined = false;
      P.notesSubmitted = 0;
      P.noteInputs = [];
      ptkGoto('ptakimNotes');
    } else {
      // Mock mode
      if (P.room && P.room.roomCode === code) {
        P.roomCode = code;
        P.isHost = false;
        P.joined = true;
        P.notesSubmitted = 0;
        P.noteInputs = [];
        ptkGoto('ptakimNotes');
      } else {
        errorEl.textContent = t('roomNotFound');
      }
    }
  };
}

/* =====================================================
   SCREEN: LOBBY
   ===================================================== */
function renderPtakimLobby(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const room = P.room;

  // Start real-time subscription when entering lobby
  if (api.isOnline() && !_unsubscribe) {
    subscribeToRoom();
  }

  // Check if all players are ready (have submitted notes)
  const allReady = room.players.length >= 2 && room.players.every(p => p.notesSubmitted);

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner">
        <div class="ptk-header">
          <button class="btn-ghost" id="ptk-lobby-back">${t('back')}</button>
          <span class="ptk-header-title">${t('waitingRoom')}</span>
        </div>

        <!-- Room Code Card -->
        <div class="ptk-lobby-code-card">
          <div class="ptk-lobby-code-label">${t('shareCode')}</div>
          <div class="ptk-lobby-code">${room.roomCode}</div>
          <button id="ptk-copy-code" class="ptk-copy-btn">📋 ${t('roomCode')}</button>
        </div>

        <!-- Players List -->
        <div class="ptk-lobby-players-section">
          <div class="ptk-label">${t('players')} (${room.players.length})</div>
          <div class="ptk-lobby-players">
            ${room.players.map((p, i) => {
              const isReady = p.notesSubmitted;
              const isMe = p.deviceId === P.deviceId;
              const isHost = p.deviceId === room.hostDeviceId;
              return `
                <div class="ptk-lobby-player ${isReady ? 'ready' : 'writing'} ${isMe ? 'me' : ''}">
                  <div class="ptk-lobby-player-avatar">
                    ${p.emoji || PLAYER_EMOJIS[i % PLAYER_EMOJIS.length]}
                  </div>
                  <div class="ptk-lobby-player-info">
                    <div class="ptk-lobby-player-name">
                      ${escHtml(p.name)}
                      ${isHost ? '<span class="ptk-badge-small host">👑</span>' : ''}
                      ${isMe ? '<span class="ptk-badge-small me">' + t('you') + '</span>' : ''}
                    </div>
                    <div class="ptk-lobby-player-status ${isReady ? 'ready' : 'writing'}">
                      ${isReady ? t('doneWriting') : t('writingNotes')}
                    </div>
                  </div>
                  <div class="ptk-lobby-player-indicator ${isReady ? 'ready' : 'writing'}">
                    ${isReady ? '✓' : '✏️'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- DEBUG: Add Mock Players -->
        ${P.isHost ? `
          <div class="ptk-debug-section">
            <div class="ptk-debug-label">🔧 DEBUG: Add Mock Players</div>
            <div class="ptk-debug-row">
              <select id="ptk-mock-count" class="ptk-debug-select">
                <option value="1">1 player</option>
                <option value="2">2 players</option>
                <option value="3" selected>3 players</option>
                <option value="4">4 players</option>
                <option value="5">5 players</option>
                <option value="6">6 players</option>
              </select>
              <button class="btn btn-secondary" id="ptk-add-mock-btn" style="padding:10px 16px;font-size:0.85rem;">
                + Add Mock Players
              </button>
            </div>
          </div>
        ` : ''}

        <div style="flex:1;"></div>

        ${P.isHost ? `
          <button class="btn btn-primary" id="ptk-start-btn" style="margin-bottom:16px;" ${!allReady ? 'disabled style="opacity:0.5;pointer-events:none;margin-bottom:16px;"' : ''}>
            ${allReady ? t('teamSetup') + ' →' : t('waitingForOthers')}
          </button>
        ` : `
          <div style="text-align:center;font-size:0.85rem;color:var(--text-dim);margin-bottom:16px;">
            ${t('waitingForHost')}
          </div>
        `}
      </div>
    </div>
  `;

  document.getElementById('ptk-lobby-back').onclick = () => {
    cleanupRoom();
    ptkGoto('ptakimHome');
  };

  document.getElementById('ptk-copy-code').onclick = () => {
    navigator.clipboard.writeText(room.roomCode).then(() => {
      const btn = document.getElementById('ptk-copy-code');
      if (btn) btn.textContent = '✓ ' + t('copied');
      setTimeout(() => { if (btn) btn.textContent = '📋 ' + t('roomCode'); }, 1500);
    }).catch(() => {});
  };

  // DEBUG: Add mock players
  if (P.isHost) {
    const addMockBtn = document.getElementById('ptk-add-mock-btn');
    const mockCountSelect = document.getElementById('ptk-mock-count');
    if (addMockBtn && mockCountSelect) {
      addMockBtn.onclick = () => {
        const count = parseInt(mockCountSelect.value) || 3;
        const mockNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry'];
        const mockNoteWords = ['Einstein', 'Napoleon', 'Cleopatra', 'Shakespeare', 'Mozart', 'Batman', 'Superman', 'Harry Potter', 'Sherlock Holmes', 'James Bond'];

        for (let i = 0; i < count; i++) {
          const name = mockNames[room.players.length % mockNames.length] + '_' + (room.players.length);
          const emoji = PLAYER_EMOJIS[(room.players.length) % PLAYER_EMOJIS.length];

          // Add mock player
          const mockPlayer = {
            deviceId: 'mock_' + Math.random().toString(36).substr(2, 8),
            name: name,
            ready: true,
            notesSubmitted: true,
            emoji: emoji,
          };
          room.players.push(mockPlayer);

          // Add mock notes for this player
          const notesPerPlayer = room.settings?.notesPerPlayer || 5;
          for (let j = 0; j < notesPerPlayer; j++) {
            const noteText = mockNoteWords[(room.notes.length) % mockNoteWords.length];
            room.notes.push({ id: room.notes.length, text: noteText, authorDeviceId: mockPlayer.deviceId });
          }
        }
        room.noteCount = room.notes.length;
        ptkGoto('ptakimLobby');
      };
    }
  }

  if (P.isHost) {
    const startBtn = document.getElementById('ptk-start-btn');
    if (startBtn) {
      startBtn.onclick = async () => {
        if (api.isOnline()) {
          await doAction('set_phase', { phase: 'team_setup' });
        } else {
          P.room.phase = 'team_setup';
        }
        ptkGoto('ptakimTeamSetup');
      };
    }
  }
}

/* =====================================================
   SCREEN: TEAM SETUP (visible to all, editable by host)
   ===================================================== */
function renderPtakimTeamSetup(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const room = P.room;
  const players = room.players || [];
  const editable = P.isHost;

  if (api.isOnline() && !_unsubscribe) {
    subscribeToRoom();
  }

  if (!room.teams || room.teams.length === 0) {
    room.teams = [
      { name: t('team') + ' A', color: TEAM_PRESETS[0].color, emoji: '🔵', players: [], playerDeviceIds: [], explainerIdx: 0, scores: [0, 0, 0] },
      { name: t('team') + ' B', color: TEAM_PRESETS[1].color, emoji: '🟢', players: [], playerDeviceIds: [], explainerIdx: 0, scores: [0, 0, 0] },
    ];
  }

  const assignedIds = new Set(room.teams.flatMap(team => team.playerDeviceIds || []));
  const unassigned = players.filter(p => !assignedIds.has(p.deviceId));

  const teamsWithPlayers = room.teams.filter(team => (team.playerDeviceIds?.length || 0) > 0);
  const teamsValid = teamsWithPlayers.length >= 2 &&
    teamsWithPlayers.every(team => (team.playerDeviceIds?.length || 0) >= 2);

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner ptk-team-setup-inner">
        <div class="ptk-header">
          ${editable ? `<button class="btn-ghost" id="ptk-teams-back">${t('back')}</button>` : ''}
          <span class="ptk-header-title">${t('teamSetup')}</span>
        </div>

        <div class="ptk-room-code-bar">
          <span class="ptk-room-code-label">${t('roomCode')}:</span>
          <span class="ptk-room-code-value">${P.roomCode}</span>
        </div>

        ${!editable ? `
          <div style="text-align:center;font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;">
            ${t('viewOnlyTeamSetup')}
          </div>
        ` : ''}

        ${editable ? `
          <div class="ptk-team-actions" style="margin-bottom:12px;">
            <button class="btn btn-secondary" id="ptk-shuffle-teams">
              ${t('shuffleTeams')}
            </button>
            <button class="btn btn-secondary" id="ptk-add-team">
              ${t('addTeam')}
            </button>
          </div>
        ` : ''}

        ${editable && unassigned.length > 0 ? `
          <div class="ptk-unassigned-section" id="ptk-unassigned-drop" data-team-idx="-1">
            <div class="ptk-label">${t('players')} (${unassigned.length}) — ${t('tapToAssign')}</div>
            <div class="ptk-unassigned-players">
              ${unassigned.map((p, i) => `
                <div class="ptk-draggable-player" data-device-id="${p.deviceId}">
                  <span class="ptk-drag-avatar">${p.emoji || PLAYER_EMOJIS[players.indexOf(p) % PLAYER_EMOJIS.length]}</span>
                  <span class="ptk-drag-name">${escHtml(p.name)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="ptk-teams-setup" id="ptk-teams-container">
          ${room.teams.map((team, teamIdx) => `
            <div class="ptk-team-setup-col">
              <div class="ptk-team-setup-header" style="background:${team.color}20;border-color:${team.color};">
                <span class="ptk-team-emoji">${team.emoji}</span>
                <span class="ptk-team-name">${escHtml(team.name)}</span>
                <span class="ptk-team-count">(${team.playerDeviceIds?.length || 0})</span>
                ${editable && room.teams.length > 2 ? `
                  <button class="ptk-remove-team-btn" data-team-idx="${teamIdx}" title="${t('removeTeam')}">✕</button>
                ` : ''}
              </div>
              <div class="ptk-team-drop-zone" data-team-idx="${teamIdx}">
                ${(team.playerDeviceIds || []).map(did => {
                  const player = players.find(p => p.deviceId === did);
                  if (!player) return '';
                  const isMe = did === P.deviceId;
                  return `
                    <div class="ptk-team-player ${isMe ? 'me' : ''}" ${editable ? `data-device-id="${did}" data-from-team="${teamIdx}"` : ''}>
                      <span class="ptk-drag-avatar">${player.emoji || PLAYER_EMOJIS[players.indexOf(player) % PLAYER_EMOJIS.length]}</span>
                      <span class="ptk-drag-name">${escHtml(player.name)}${isMe ? ' <small style="color:var(--text-muted);">(' + t('you') + ')</small>' : ''}</span>
                      ${editable ? `<button class="ptk-remove-from-team" data-device-id="${did}" title="${t('removeTeam')}">✕</button>` : ''}
                    </div>
                  `;
                }).join('')}
                ${(team.playerDeviceIds?.length || 0) === 0 ? `
                  <div class="ptk-drop-placeholder">
                    ${editable ? t('tapToAssign') : ''}
                  </div>
                ` : ''}
                ${(team.playerDeviceIds?.length || 0) > 0 && (team.playerDeviceIds?.length || 0) < 2 ? `
                  <div class="ptk-team-warning">
                    ⚠️ ${t('minTwoPerTeam')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="flex:1;"></div>

        ${editable ? `
          <button class="btn btn-primary ptk-sticky-bottom-btn" id="ptk-start-game-btn" ${!teamsValid ? 'disabled style="opacity:0.5;pointer-events:none;"' : ''}>
            ${t('startGame')} →
          </button>
        ` : ''}
      </div>
    </div>
  `;

  if (editable) {
    document.getElementById('ptk-teams-back').onclick = async () => {
      if (api.isOnline()) {
        await doAction('set_phase', { phase: 'lobby' });
      } else {
        P.room.phase = 'lobby';
      }
      ptkGoto('ptakimLobby');
    };
  }

  if (!editable) return;

  document.getElementById('ptk-add-team').onclick = () => {
    const teamColors = ['#6C63FF', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#0ea5e9', '#d946ef', '#f59e0b'];
    const teamEmojis = ['🔵', '🟢', '🟠', '🔴', '🟣', '🔷', '💜', '🟡'];
    const newIdx = room.teams.length;
    const letter = String.fromCharCode(65 + newIdx);
    room.teams.push({
      name: t('team') + ' ' + letter,
      color: teamColors[newIdx % teamColors.length],
      emoji: teamEmojis[newIdx % teamEmojis.length],
      players: [],
      playerDeviceIds: [],
      explainerIdx: 0,
      scores: [0, 0, 0]
    });
    syncTeamsToServer();
    ptkGoto('ptakimTeamSetup');
  };

  document.querySelectorAll('.ptk-remove-team-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const teamIdx = parseInt(btn.dataset.teamIdx);
      if (room.teams.length > 2) {
        room.teams.splice(teamIdx, 1);
        syncTeamsToServer();
        ptkGoto('ptakimTeamSetup');
      }
    };
  });

  document.getElementById('ptk-shuffle-teams').onclick = () => {
    const shuffled = shuffleArray([...players]);
    const numTeams = room.teams.length;
    room.teams.forEach(team => {
      team.playerDeviceIds = [];
      team.players = [];
    });
    shuffled.forEach((p, i) => {
      const teamIdx = i % numTeams;
      room.teams[teamIdx].playerDeviceIds.push(p.deviceId);
    });
    room.teams.forEach(team => {
      team.players = team.playerDeviceIds.map(did => players.find(p => p.deviceId === did));
    });
    syncTeamsToServer();
    ptkGoto('ptakimTeamSetup');
  };

  function movePlayerToTeam(deviceId, targetTeamIdx) {
    room.teams.forEach(team => {
      team.playerDeviceIds = (team.playerDeviceIds || []).filter(id => id !== deviceId);
    });
    if (targetTeamIdx >= 0 && targetTeamIdx < room.teams.length) {
      if (!room.teams[targetTeamIdx].playerDeviceIds) {
        room.teams[targetTeamIdx].playerDeviceIds = [];
      }
      room.teams[targetTeamIdx].playerDeviceIds.push(deviceId);
    }
    room.teams.forEach(team => {
      team.players = (team.playerDeviceIds || []).map(id => players.find(p => p.deviceId === id));
    });
    syncTeamsToServer();
    ptkGoto('ptakimTeamSetup');
  }

  // Tap to assign unassigned player to team with fewest players
  document.querySelectorAll('.ptk-draggable-player').forEach(el => {
    el.onclick = () => {
      const did = el.dataset.deviceId;
      let minLen = Infinity, minIdx = 0;
      room.teams.forEach((team, i) => {
        const len = team.playerDeviceIds?.length || 0;
        if (len < minLen) { minLen = len; minIdx = i; }
      });
      movePlayerToTeam(did, minIdx);
    };
  });

  // Tap team player to cycle to next team
  document.querySelectorAll('.ptk-team-player[data-device-id]').forEach(el => {
    el.onclick = (e) => {
      if (e.target.classList.contains('ptk-remove-from-team')) return;
      const did = el.dataset.deviceId;
      const fromTeam = parseInt(el.dataset.fromTeam);
      const targetTeam = (fromTeam + 1) % room.teams.length;
      movePlayerToTeam(did, targetTeam);
    };
  });

  document.querySelectorAll('.ptk-remove-from-team').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const did = btn.dataset.deviceId;
      movePlayerToTeam(did, -1);
    };
  });

  // Drag and Drop (desktop)
  let draggedPlayerId = null;

  document.querySelectorAll('.ptk-draggable-player, .ptk-team-player[data-device-id]').forEach(el => {
    el.draggable = true;
    el.ondragstart = (e) => {
      draggedPlayerId = el.dataset.deviceId;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedPlayerId);
    };
    el.ondragend = () => {
      el.classList.remove('dragging');
      draggedPlayerId = null;
      document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
    };
  });

  document.querySelectorAll('.ptk-team-drop-zone, .ptk-unassigned-section').forEach(zone => {
    zone.ondragover = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    };
    zone.ondragleave = (e) => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    };
    zone.ondrop = (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const deviceId = e.dataTransfer.getData('text/plain') || draggedPlayerId;
      if (!deviceId) return;
      const targetTeamIdx = parseInt(zone.dataset.teamIdx);
      movePlayerToTeam(deviceId, targetTeamIdx);
    };
  });

  document.getElementById('ptk-start-game-btn').onclick = async () => {
    room.teams.forEach(team => {
      team.players = (team.playerDeviceIds || []).map(did => {
        const p = players.find(pl => pl.deviceId === did);
        return p ? { deviceId: did, name: p.name, emoji: p.emoji } : { deviceId: did, name: did };
      });
    });

    if (api.isOnline()) {
      await doAction('start_game', { teams: room.teams });
    } else {
      startRound(1);
    }
    ptkGoto('ptakimRoundIntro');
  };
}

function syncTeamsToServer() {
  if (api.isOnline() && P.room) {
    doAction('update_teams', { teams: P.room.teams });
  }
}

/* =====================================================
   SCREEN: NOTE ENTRY
   ===================================================== */
function renderPtakimNotes(app) {
  if (!P.roomCode) { ptkGoto('ptakimHome'); return; }
  const total = P.room?.settings?.notesPerPlayer || P.settings.notesPerPlayer;
  const submitted = P.notesSubmitted;
  const done = submitted >= total;
  const players = P.room?.players || [];

  // Start polling for room updates if not already subscribed
  if (api.isOnline() && P.room?.id && !_unsubscribe) {
    subscribeToRoom();
  }

  // Build player status chips
  const playerChipsHtml = players.length > 0 ? `
    <div class="ptk-players-bar">
      ${players.map((p, i) => {
        const isMe = p.deviceId === P.deviceId;
        const isDone = p.notesSubmitted;
        const statusClass = isDone ? 'done' : 'writing';
        const statusIcon = isDone ? '✓' : '✏️';
        return `
          <div class="ptk-player-chip ${statusClass} ${isMe ? 'me' : ''}">
            <span class="ptk-player-chip-emoji">${p.emoji || PLAYER_EMOJIS[i % PLAYER_EMOJIS.length]}</span>
            <span class="ptk-player-chip-name">${escHtml(p.name)}${isMe ? '' : ''}</span>
            <span class="ptk-player-chip-status">${statusIcon}</span>
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner">
        <div class="ptk-header">
          <span class="ptk-header-title">${t('writeNotes')}</span>
        </div>

        <!-- Players status bar -->
        ${playerChipsHtml}

        <!-- Room code for sharing -->
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:4px;">${t('shareCode')}</div>
          <div class="ptk-room-code" style="font-size:2rem;">${P.roomCode}</div>
          <button id="ptk-copy-code-notes" style="margin-top:4px;background:none;border:none;color:#6C63FF;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:inherit;">
            📋 ${t('roomCode')}
          </button>
        </div>

        <div class="ptk-note-counter">${t('noteOf')} ${submitted} ${t('of')} ${total}</div>
        <div class="ptk-note-progress">
          <div class="ptk-note-progress-fill" style="width:${(submitted/total)*100}%;"></div>
        </div>

        ${done ? `
          <div class="ptk-notes-done">
            <div class="ptk-notes-done-icon">✅</div>
            <div class="ptk-notes-done-text">${t('notesDone')}</div>
            <div style="height:16px;"></div>
            <div id="ptk-notes-error" style="color:#dc2626;font-size:0.85rem;min-height:20px;margin-bottom:8px;"></div>
            <button class="btn btn-primary" id="ptk-notes-continue" style="font-size:1.1rem;">
              ${P.joined ? t('goToLobby') : '🎮 ' + t('joinNow')}
            </button>
          </div>
        ` : `
          <div class="ptk-sticky-note">
            <textarea class="ptk-sticky-note-input" id="ptk-note-input"
              placeholder="${t('notePlaceholder')}"
              maxlength="40" autocomplete="off" rows="2"></textarea>
            <button class="ptk-sticky-note-btn" id="ptk-submit-note">
              ${submitted + 1 === total ? t('submitNoteDone') : t('submitNote')}
            </button>
          </div>
        `}

        ${P.noteInputs.length > 0 ? `
          <div class="ptk-submitted-notes">
            ${P.noteInputs.map(n => `
              <div class="ptk-mini-note">${escHtml(n)}</div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Copy room code
  const copyBtn = document.getElementById('ptk-copy-code-notes');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(P.roomCode).then(() => {
        copyBtn.textContent = '✓ ' + t('copied');
        setTimeout(() => { copyBtn.textContent = '📋 ' + t('roomCode'); }, 1500);
      }).catch(() => {});
    };
  }

  if (!done) {
    const input = document.getElementById('ptk-note-input');
    const submitBtn = document.getElementById('ptk-submit-note');
    if (input) {
      setTimeout(() => input.focus(), 100);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmitNote(input); });
    }
    if (submitBtn) submitBtn.onclick = () => doSubmitNote(input);
  }

  const continueBtn = document.getElementById('ptk-notes-continue');
  if (continueBtn) {
    continueBtn.onclick = async () => {
      const errorEl = document.getElementById('ptk-notes-error');
      continueBtn.disabled = true;
      continueBtn.style.opacity = '0.6';

      if (api.isOnline()) {
        if (!P.joined) {
          // Joiner: join room + submit notes in one atomic call
          const result = await api.joinAndSubmitNotes(P.roomCode, P.deviceId, P.playerName, P.noteInputs);
          if (!result || !result.success) {
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1';
            const err = result?.error || 'Failed to join';
            if (err === 'Name already taken') errorEl.textContent = t('nameTaken');
            else if (err === 'Game already started') errorEl.textContent = t('gameStarted');
            else errorEl.textContent = err;
            return;
          }
          P.room = normalizeRoom(result.room);
          if (result.roomId) P.room.id = result.roomId;
          P.joined = true;
        } else {
          // Host: just submit notes
          await api.submitNotes(P.roomCode, P.deviceId, P.noteInputs);
        }
      } else {
        // Mock mode: add notes to room
        P.noteInputs.forEach(text => {
          P.room.notes.push({ id: P.room.notes.length, text, authorDeviceId: P.deviceId });
        });
        P.room.noteCount = P.room.notes.length;
        const myPlayer = P.room.players.find(p => p.deviceId === P.deviceId);
        if (myPlayer) myPlayer.notesSubmitted = true;
      }

      ptkGoto('ptakimLobby');
    };
  }
}

function doSubmitNote(input) {
  if (!input) return;
  const text = (input.value || '').trim();
  if (!text) return;

  P.noteInputs.push(text);
  P.notesSubmitted++;
  ptkGoto('ptakimNotes');
}

/* =====================================================
   SCREEN: ROUND INTRO
   ===================================================== */
function renderPtakimRoundIntro(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const round = P.room.currentRound;
  const roundNames = [null, t('round1name'), t('round2name'), t('round3name')];
  const roundDescs = [null, t('round1desc'), t('round2desc'), t('round3desc')];
  const roundIcons = [null, '🗣️', '☝️', '🤫'];

  const turn = P.room.currentTurn;
  const firstTeam = turn ? P.room.teams[turn.teamIdx] : P.room.teams[0];
  const firstPlayerIdx = turn ? turn.playerIdx : (firstTeam?.explainerIdx || 0);
  const firstPlayer = firstTeam?.players?.[firstPlayerIdx];

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:center;text-align:center;">
        <div class="ptk-round-badge">${t('round')} ${round} / 3</div>
        <div class="ptk-round-number">${roundIcons[round] || round}</div>
        <div class="ptk-round-rule">${roundNames[round] || ''}</div>
        <div class="ptk-round-desc">${(roundDescs[round] || '').replace(/\n/g, '<br>')}</div>
        <div style="height:12px;"></div>
        <div style="font-size:0.85rem;color:var(--text-dim);">
          ${P.room.noteCount || P.room.notes.length} ${t('notes')}
        </div>

        ${firstTeam && firstPlayer ? `
          <div style="margin-top:20px;padding:16px;background:${firstTeam.color}15;border:2px solid ${firstTeam.color}40;border-radius:16px;">
            <div style="font-size:0.82rem;color:var(--text-dim);margin-bottom:6px;">${t('itIsTurnOf')}</div>
            <div style="font-size:1.2rem;font-weight:800;">
              <span style="color:${firstTeam.color};">${firstTeam.emoji} ${escHtml(firstTeam.name)}</span>
              <span style="color:var(--text-dim);"> · </span>
              ${escHtml(firstPlayer.name)}
            </div>
          </div>
        ` : ''}

        <div style="height:24px;"></div>
        ${P.isHost ? `
          <button class="btn btn-primary" id="ptk-start-round-btn">
            ${t('startRound')}
          </button>
        ` : `
          <div style="font-size:0.88rem;color:var(--text-dim);">${t('waitingForHost')}</div>
        `}
      </div>
    </div>
  `;

  const startRoundBtn = document.getElementById('ptk-start-round-btn');
  if (startRoundBtn) {
    startRoundBtn.onclick = async () => {
      if (!api.isOnline()) {
        P.room.currentTurn = {
          teamIdx: 0,
          playerIdx: P.room.teams[0].explainerIdx,
          startTime: null,
          endTime: null,
        };
        P.room.phase = 'turn_active';
      }
      ptkGoto('ptakimPlaying');
    };
  }
}

/* =====================================================
   SCREEN: PLAYING (active turn)
   ===================================================== */
function renderPtakimPlaying(app) {
  if (!P.room || !P.room.currentTurn) { ptkGoto('ptakimHome'); return; }
  const turn = P.room.currentTurn;
  const team = P.room.teams[turn.teamIdx];
  const player = team.players[turn.playerIdx];
  const round = P.room.currentRound;
  const roundNames = [null, t('round1name'), t('round2name'), t('round3name')];
  const timerStarted = !!turn.startTime;
  const active = isActivePlayer();
  const note = active ? getCurrentNote() : null;
  const deckSize = P.room.deck?.length || P.room.noteCount || 0;
  const deckIdx = P.room.deckIndex || 0;
  const notesRemaining = Math.max(0, deckSize - deckIdx);
  const isLoading = note?.loading;

  // Timer color
  let timerColor = '#16a34a';
  const pct = timerStarted ? P.timeLeft / TURN_SECONDS : 1;
  if (pct < 0.25) timerColor = '#dc2626';
  else if (pct < 0.5) timerColor = '#ca8a04';

  const dashOffset = CIRCUMFERENCE * (1 - pct);

  // Room code bar (so players can still join)
  const roomCodeBarHtml = `
    <div class="ptk-room-code-bar" style="margin-bottom:8px;">
      <span class="ptk-room-code-label">${t('roomCode')}:</span>
      <span class="ptk-room-code-value">${P.roomCode}</span>
      ${P.isHost ? `<button class="ptk-end-game-btn" id="ptk-end-game">⏹ ${t('endGame')}</button>` : ''}
    </div>
  `;

  // Common header
  const headerHtml = `
    ${roomCodeBarHtml}
    <div style="width:100%;text-align:center;">
      <div class="ptk-round-indicator">${t('roundN')} ${round} — ${roundNames[round] || ''}</div>
      <div style="font-size:0.85rem;margin-bottom:4px;">
        <span style="color:${team.color};font-weight:700;">${team.emoji} ${escHtml(team.name)}</span>
      </div>
      <div style="font-size:1rem;font-weight:700;margin-bottom:4px;">
        ${escHtml(player.name)} ${t('nowPlaying')}
        ${active ? `<span style="font-size:0.75rem;color:var(--text-muted);"> (${t('you')})</span>` : ''}
      </div>
    </div>
  `;

  // Common timer
  const timerHtml = `
    <div class="ptk-timer-wrap">
      <svg width="120" height="120" class="ptk-timer-circle">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" stroke-width="8"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke="${timerColor}" stroke-width="8"
          stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${dashOffset}"
          stroke-linecap="round" style="transition:stroke-dashoffset 0.2s,stroke 0.3s;"/>
      </svg>
      <div class="ptk-timer-text" style="color:${timerColor};">
        ${timerStarted ? P.timeLeft : TURN_SECONDS}
      </div>
    </div>
  `;

  if (!active) {
    // ── SPECTATOR VIEW ──
    if (!timerStarted) {
      app.innerHTML = `
        <div class="ptk-screen">
          <div class="ptk-inner" style="justify-content:space-between;">
            ${headerHtml}
            <div style="display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;gap:16px;">
              ${timerHtml}
              <div class="ptk-spectator-card" style="padding:40px 24px;">
                <div class="ptk-spectator-icon">⏳</div>
                <div style="font-size:0.9rem;color:var(--text-dim);margin-top:8px;">
                  ${t('waitingToStart')}
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      `;
    } else {
      app.innerHTML = `
        <div class="ptk-screen">
          <div class="ptk-inner" style="justify-content:space-between;">
            ${headerHtml}
            <div style="display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;gap:16px;">
              ${timerHtml}
              <div class="ptk-spectator-card">
                <div class="ptk-spectator-icon">👀</div>
                <div class="ptk-spectator-text">${escHtml(player.name)} ${t('turnInProgress')}</div>
              </div>
              <div class="ptk-deck-count">${notesRemaining} ${t('notes')}</div>
            </div>
            <div style="text-align:center;padding-bottom:8px;">
              <div style="font-size:0.78rem;color:var(--text-muted);">
                ${t('guessed')}: ${P.turnCorrect} · ${t('skipped')}: ${P.turnSkipped}
              </div>
            </div>
          </div>
        </div>
      `;
    }
    attachEndGameHandler();
    return;
  }

  // ── ACTIVE PLAYER VIEW ──
  const overlayVisible = P.noteVisibility !== 'hidden';

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:space-between;">
        ${headerHtml}

        <div style="display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;gap:12px;">
          ${timerHtml}

          ${!timerStarted ? `
            <button class="btn btn-primary" id="ptk-play-btn" style="max-width:240px;font-size:1.1rem;">
              ${t('startTurn')}
            </button>
          ` : `
            <div class="ptk-note-card" id="ptk-note-card">
              ${note && !isLoading ? `<div class="ptk-note-text">${escHtml(note.text)}</div>` :
                isLoading ? `<div class="ptk-note-text ptk-loading">⏳</div>` :
                `<div class="ptk-note-text">${t('deckEmpty')}</div>`}
              ${note && !isLoading ? `
                <div class="ptk-note-hidden-overlay" id="ptk-note-overlay"
                  style="opacity:${overlayVisible ? '0' : '1'};pointer-events:${overlayVisible ? 'none' : 'auto'};">
                  <div class="ptk-note-hidden-icon">👁️</div>
                  <div class="ptk-note-hidden-text">${t('holdToReveal')}</div>
                </div>
              ` : ''}
            </div>

            <div class="ptk-deck-count">${notesRemaining} ${t('notes')}</div>

            ${note && !isLoading ? `
              <div class="ptk-play-buttons">
                ${P.room.settings.skipAllowed ? `
                  <button class="btn btn-skip" id="ptk-skip-btn" style="flex:1;">
                    ${t('skip')}
                  </button>
                ` : ''}
                <button class="btn btn-correct" id="ptk-correct-btn" style="flex:${P.room.settings.skipAllowed ? '2' : '1'};">
                  ${t('correct')}
                </button>
              </div>
            ` : ''}
          `}
        </div>

        <div style="text-align:center;padding-bottom:8px;">
          <div style="font-size:0.78rem;color:var(--text-muted);">
            ${t('guessed')}: ${P.turnCorrect} · ${t('skipped')}: ${P.turnSkipped}
          </div>
        </div>
      </div>
    </div>
  `;

  // Event handlers
  const playBtn = document.getElementById('ptk-play-btn');
  if (playBtn) {
    playBtn.onclick = async () => {
      // Disable button to prevent double-click
      playBtn.disabled = true;
      playBtn.textContent = '⏳';

      if (api.isOnline()) {
        // Tell server to start turn - server sets authoritative timestamps
        const result = await doAction('start_turn');
        // Server response updates P.room with current_turn.start_time and end_time

        // Fetch the first note
        const noteResult = await api.getNote(P.roomCode, P.deviceId);
        if (noteResult && noteResult.text) {
          P._currentNoteText = noteResult.text;
        }
      }

      // Start local timer and render (uses server timestamps if available)
      startTurn();
    };
  }

  const correctBtn = document.getElementById('ptk-correct-btn');
  if (correctBtn) correctBtn.onclick = async () => {
    if (api.isOnline()) {
      P.turnCorrect++;
      await doAction('correct', { turnCorrect: P.turnCorrect, turnSkipped: P.turnSkipped });
      // Fetch next note after server increments deck_index
      const noteResult = await api.getNote(P.roomCode, P.deviceId);
      if (noteResult && noteResult.text) {
        P._currentNoteText = noteResult.text;
        P.noteVisibility = 'hidden';
        flashCard('correct');
        showAutoReveal();
        ptkRender();
      } else {
        // Deck exhausted
        P._currentNoteText = null;
        endTurn(true);
      }
    } else {
      handleCorrect(); // increments turnCorrect internally
    }
  };

  const skipBtn = document.getElementById('ptk-skip-btn');
  if (skipBtn) skipBtn.onclick = async () => {
    if (api.isOnline()) {
      P.turnSkipped++;
      await doAction('skip', { turnCorrect: P.turnCorrect, turnSkipped: P.turnSkipped });
      const noteResult = await api.getNote(P.roomCode, P.deviceId);
      if (noteResult && noteResult.text) {
        P._currentNoteText = noteResult.text;
        P.noteVisibility = 'hidden';
        flashCard('skip');
        showAutoReveal();
        ptkRender();
      } else {
        P._currentNoteText = null;
        endTurn(true);
      }
    } else {
      handleSkip(); // increments turnSkipped internally
    }
  };

  // Press-and-hold to reveal - always attach listeners
  const noteCard = document.getElementById('ptk-note-card');
  if (noteCard) {
    const reveal = () => {
      P.noteVisibility = 'hold';
      clearTimeout(P.autoRevealTimeout);
      updateNoteOverlay();
    };
    const hide = () => {
      P.noteVisibility = 'hidden';
      updateNoteOverlay();
    };
    // Use named functions to avoid duplicate listeners
    noteCard.onpointerdown = reveal;
    noteCard.onpointerup = hide;
    noteCard.onpointerleave = hide;
    noteCard.onpointercancel = hide;
    noteCard.ontouchstart = (e) => { e.preventDefault(); reveal(); };
    noteCard.ontouchend = hide;
    noteCard.ontouchcancel = hide;
  }

  // End game button (host only)
  attachEndGameHandler();
}

// Attach end game button handler
function attachEndGameHandler() {
  const endGameBtn = document.getElementById('ptk-end-game');
  if (endGameBtn) {
    endGameBtn.onclick = () => {
      showEndGameConfirm();
    };
  }
}

// Show end game confirmation modal
function showEndGameConfirm() {
  const modal = document.createElement('div');
  modal.className = 'ptk-modal-overlay';
  modal.innerHTML = `
    <div class="ptk-modal">
      <div class="ptk-modal-icon">⚠️</div>
      <div class="ptk-modal-text">${t('endGameConfirm')}</div>
      <div class="ptk-modal-buttons">
        <button class="btn btn-secondary" id="ptk-modal-no">${t('no')}</button>
        <button class="btn btn-danger" id="ptk-modal-yes">${t('yes')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('ptk-modal-no').onclick = () => {
    modal.remove();
  };

  document.getElementById('ptk-modal-yes').onclick = async () => {
    modal.remove();
    // Send end game to server so all connected devices get notified
    if (api.isOnline()) {
      try {
        await doAction('end_game');
        // Give server a moment to broadcast to other clients
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.warn('[Ptakim] End game API error:', e);
      }
    }
    // Brute force cleanup - stop everything immediately
    forceEndGame();
  };
}

// Show turn end confirmation - ask if team guessed the last word
function showTurnEndConfirm() {
  // Only show for active player
  if (!isActivePlayer()) {
    // Spectators just wait - the active player will answer
    return;
  }

  const lastWord = P._currentNoteText || '?';

  const modal = document.createElement('div');
  modal.className = 'ptk-modal-overlay';
  modal.id = 'ptk-turn-end-modal';
  modal.innerHTML = `
    <div class="ptk-modal">
      <div class="ptk-modal-icon">⏰</div>
      <div class="ptk-modal-title" style="font-size:1.3rem;font-weight:800;margin-bottom:8px;">${t('timeUp')}</div>
      <div class="ptk-modal-text">${t('didTeamGuess')}</div>
      <div class="ptk-last-word-display">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">${t('lastWord')}:</div>
        <div style="font-size:1.4rem;font-weight:800;">${escHtml(lastWord)}</div>
      </div>
      <div class="ptk-modal-buttons" style="margin-top:16px;">
        <button class="btn btn-secondary" id="ptk-turn-no" style="flex:1;">
          ${t('didNotGuess')}
        </button>
        <button class="btn btn-correct" id="ptk-turn-yes" style="flex:1;">
          ${t('guessedIt')}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('ptk-turn-no').onclick = async () => {
    modal.remove();
    // Don't count the last word as correct
    await endTurnWithResult(false);
  };

  document.getElementById('ptk-turn-yes').onclick = async () => {
    modal.remove();
    // Count the last word as correct
    P.turnCorrect++;
    await endTurnWithResult(true);
  };
}

// End turn with result (called from turn end confirmation)
async function endTurnWithResult(lastWordGuessed) {
  if (api.isOnline()) {
    await doAction('end_turn', {
      turnCorrect: P.turnCorrect,
      turnSkipped: P.turnSkipped,
      lastWordGuessed: lastWordGuessed
    });
  }
  // skipServerAction = true because we already called doAction above
  endTurn(false, true);
}

// Force end game - cleans up everything and goes back to main menu
function forceEndGame() {
  // Stop all timers
  clearInterval(P.localTimer);
  clearTimeout(P.autoRevealTimeout);
  // Unsubscribe from room updates
  if (_unsubscribe) {
    _unsubscribe();
    _unsubscribe = null;
  }
  clearInterval(_pollInterval);
  // Clear all state
  _lastRoomHash = null;
  P.room = null;
  P.roomCode = null;
  P.isHost = false;
  P.joined = false;
  P.notesSubmitted = 0;
  P.noteInputs = [];
  P._currentNoteText = null;
  P.noteVisibility = 'hidden';
  P.turnCorrect = 0;
  P.turnSkipped = 0;
  P.timeLeft = 0;
  P.localTimer = null;
  P.autoRevealTimeout = null;
  // Clear persisted state
  clearGameState();
  // Navigate back to main menu (mode select)
  P.screen = 'modeSelect';
  if (window.G) {
    window.G.screen = 'modeSelect';
    if (typeof window.render === 'function') {
      window.render();
      return;
    }
  }
  // Fallback if G not available
  ptkRender();
}

/* =====================================================
   SCREEN: TURN RESULT
   ===================================================== */
function renderPtakimTurnResult(app) {
  if (!P.room || !P.room.turnResults) { ptkGoto('ptakimHome'); return; }
  const res = P.room.turnResults;
  const team = P.room.teams[res.teamIdx];
  const player = team.players[res.playerIdx];

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:center;text-align:center;">
        <div style="font-size:1.3rem;font-weight:800;margin-bottom:20px;">${t('turnResults')}</div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
          <span style="color:${team.color};font-size:1.2rem;">${team.emoji}</span>
          <span style="font-weight:700;">${escHtml(team.name)}</span>
          <span style="color:var(--text-dim);"> — ${escHtml(player.name)}</span>
        </div>

        <div class="ptk-result-card">
          <div style="display:flex;justify-content:space-around;">
            <div style="text-align:center;">
              <div style="font-size:2rem;font-weight:900;color:#16a34a;">${res.correct}</div>
              <div style="font-size:0.78rem;color:var(--text-dim);">${t('guessed')}</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:2rem;font-weight:900;color:#dc2626;">${res.skipped}</div>
              <div style="font-size:0.78rem;color:var(--text-dim);">${t('skipped')}</div>
            </div>
          </div>
        </div>

        <div style="height:24px;"></div>

        <button class="btn btn-primary" id="ptk-next-turn-btn">
          ${t('nextPlayer')} →
        </button>
      </div>
    </div>
  `;

  document.getElementById('ptk-next-turn-btn').onclick = async () => {
    if (api.isOnline()) {
      await doAction('next_turn');
    } else {
      advanceToNextTurn();
    }
    ptkGoto('ptakimPlaying');
  };
}

/* =====================================================
   SCREEN: ROUND RESULT
   ===================================================== */
function renderPtakimRoundResult(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const round = P.room.currentRound;
  const roundNames = [null, t('round1name'), t('round2name'), t('round3name')];
  const res = P.room.turnResults;

  // If we have turn results, add them first
  if (res) {
    const team = P.room.teams[res.teamIdx];
    // Already recorded in endTurn
  }

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:center;">
        <div style="text-align:center;margin-bottom:24px;">
          <div class="ptk-round-badge">${t('round')} ${round} / 3</div>
          <div style="font-size:1.3rem;font-weight:800;margin-top:8px;">${t('roundResults')}</div>
          <div style="font-size:0.88rem;color:var(--text-dim);">${roundNames[round] || ''}</div>
        </div>

        <div class="ptk-result-card">
          ${P.room.teams.map((team, i) => `
            <div class="ptk-score-row">
              <div class="ptk-score-team">
                <div class="ptk-score-dot" style="background:${team.color};"></div>
                ${team.emoji} ${escHtml(team.name)}
              </div>
              <div class="ptk-score-val" style="color:${team.color};">${team.scores[round - 1]}</div>
            </div>
          `).join('')}
        </div>

        <div class="ptk-result-card">
          <div class="ptk-result-title">${t('totalScore')}</div>
          ${P.room.teams.map((team, i) => `
            <div class="ptk-score-row">
              <div class="ptk-score-team">
                <div class="ptk-score-dot" style="background:${team.color};"></div>
                ${team.emoji} ${escHtml(team.name)}
              </div>
              <div class="ptk-score-round-cols">
                <div class="ptk-score-round-col">${t('r1short')}<br><b>${team.scores[0]}</b></div>
                <div class="ptk-score-round-col">${t('r2short')}<br><b>${team.scores[1]}</b></div>
                <div class="ptk-score-round-col">${t('r3short')}<br><b>${team.scores[2]}</b></div>
              </div>
              <div class="ptk-score-val" style="color:${team.color};">${getTeamTotalScore(i)}</div>
            </div>
          `).join('')}
        </div>

        <div style="height:20px;"></div>

        <button class="btn btn-primary" id="ptk-next-round-btn">
          ${round >= 3 ? t('gameOver') : t('nextRound')}
        </button>
      </div>
    </div>
  `;

  document.getElementById('ptk-next-round-btn').onclick = async () => {
    if (api.isOnline()) {
      await doAction('next_round');
    } else {
      advanceToNextRound();
    }
    if (P.room.phase === 'game_finished') {
      ptkGoto('ptakimFinal');
    } else {
      ptkGoto('ptakimRoundIntro');
    }
  };
}

/* =====================================================
   SCREEN: FINAL (game over)
   ===================================================== */
function renderPtakimFinal(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const winnerIdx = getWinnerTeamIdx();
  const winner = P.room.teams[winnerIdx];

  // Launch confetti if available
  if (typeof window.launchConfetti === 'function') {
    setTimeout(() => window.launchConfetti(), 300);
  }

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:center;text-align:center;">
        <div class="ptk-final-trophy">🏆</div>
        <div style="font-size:0.88rem;color:var(--text-dim);font-weight:700;">${t('winner')}</div>
        <div class="ptk-final-winner" style="color:${winner.color};">
          ${winner.emoji} ${escHtml(winner.name)}
        </div>
        <div class="ptk-final-subtitle">${getTeamTotalScore(winnerIdx)} ${t('notes')}</div>

        <div class="ptk-result-card" style="text-align:left;">
          <div class="ptk-result-title">${t('finalScores')}</div>
          ${P.room.teams.map((team, i) => `
            <div class="ptk-score-row">
              <div class="ptk-score-team">
                <div class="ptk-score-dot" style="background:${team.color};"></div>
                ${team.emoji} ${escHtml(team.name)}
                ${i === winnerIdx ? ' 🏆' : ''}
              </div>
              <div class="ptk-score-round-cols">
                <div class="ptk-score-round-col">${t('r1short')}<br><b>${team.scores[0]}</b></div>
                <div class="ptk-score-round-col">${t('r2short')}<br><b>${team.scores[1]}</b></div>
                <div class="ptk-score-round-col">${t('r3short')}<br><b>${team.scores[2]}</b></div>
              </div>
              <div class="ptk-score-val" style="color:${team.color};font-size:1.3rem;">${getTeamTotalScore(i)}</div>
            </div>
          `).join('')}
        </div>

        <div style="height:24px;"></div>

        <button class="btn btn-primary" id="ptk-play-again" style="margin-bottom:10px;">
          ${t('playAgain')}
        </button>
        <button class="btn btn-secondary" id="ptk-back-menu">
          ${t('backToMenu')}
        </button>
      </div>
    </div>
  `;

  document.getElementById('ptk-play-again').onclick = () => {
    cleanupRoom();
    ptkGoto('ptakimHome');
  };

  document.getElementById('ptk-back-menu').onclick = () => {
    cleanupRoom();
    if (window.G) {
      window.G.screen = 'modeSelect';
      if (typeof window.render === 'function') window.render();
    }
  };
}

/* =====================================================
   UTILITIES
   ===================================================== */
function lang() {
  return (window.G && window.G.uiLang) || 'he';
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function cleanupRoom() {
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
  clearInterval(P.localTimer);
  clearInterval(_pollInterval);
  clearTimeout(P.autoRevealTimeout);
  _lastRoomHash = null;
  P.room = null;
  P.roomCode = null;
  P.joined = false;
  P.notesSubmitted = 0;
  P.noteInputs = [];
  P._currentNoteText = null;
  P.noteVisibility = 'hidden';
  clearGameState(); // Clear persisted state
}

/* =====================================================
   REGISTER SCREENS GLOBALLY
   ===================================================== */
window.PTAKIM_SCREENS = {
  ptakimHome: renderPtakimHome,
  ptakimCreate: renderPtakimCreate,
  ptakimJoin: renderPtakimJoin,
  ptakimLobby: renderPtakimLobby,
  ptakimTeamSetup: renderPtakimTeamSetup,
  ptakimNotes: renderPtakimNotes,
  ptakimRoundIntro: renderPtakimRoundIntro,
  ptakimPlaying: renderPtakimPlaying,
  ptakimTurnResult: renderPtakimTurnResult,
  ptakimRoundResult: renderPtakimRoundResult,
  ptakimFinal: renderPtakimFinal,
};

// Expose for use from inline script
window.ptkGoto = ptkGoto;
window.P = P;
window.forceEndGame = forceEndGame; // Emergency exit

/* =====================================================
   INITIALIZATION — Restore state on page load
   ===================================================== */
(function initPtakim() {
  // Try to restore saved game state
  const restored = restoreGameState();
  if (restored && P.roomCode) {
    // Re-sync with server to get latest room state
    if (api.isOnline()) {
      api.getRoom(P.roomCode).then(raw => {
        if (raw) {
          applyRoomUpdate(raw, 'restore');
          subscribeToRoom();
          // If we're on a Ptakim screen, update the global screen and render
          if (window.G && P.screen.startsWith('ptakim')) {
            window.G.screen = P.screen;
            if (typeof window.render === 'function') {
              window.render();
            }
          }
        } else {
          // Room no longer exists on server
          console.log('[Ptakim] Room not found on server, clearing state');
          cleanupRoom();
          P.screen = 'ptakimHome';
        }
      }).catch(err => {
        console.warn('[Ptakim] Failed to restore room from server:', err);
      });
    }
  }
})();
