/* =====================================================
   PTAKIM — Multiplayer Party Game
   =====================================================
   Simplified flow:
     Home → Setup (merged create/join) → Room (lobby + notes) →
     Round Intro → Playing → Turn/Round Results → Final
   ===================================================== */
import './ptakim.css';
import * as api from './ptakim-api.js';

/* =====================================================
   CONSTANTS
   ===================================================== */
const TURN_SECONDS = 60;
const PLAYER_AVATARS = [
  { id: 'ninja', icon: '🥷' },
  { id: 'wizard', icon: '🧙' },
  { id: 'alien', icon: '👽' },
  { id: 'robot', icon: '🤖' },
  { id: 'ghost', icon: '👻' },
  { id: 'pirate', icon: '🏴‍☠️' },
  { id: 'dragon', icon: '🐉' },
  { id: 'unicorn', icon: '🦄' },
  { id: 'phoenix', icon: '🔥' },
  { id: 'crown', icon: '👑' },
  { id: 'star', icon: '⭐' },
  { id: 'rocket', icon: '🚀' },
  { id: 'diamond', icon: '💎' },
  { id: 'lightning', icon: '⚡' },
  { id: 'skull', icon: '💀' },
  { id: 'cat', icon: '🐱' },
  { id: 'wolf', icon: '🐺' },
  { id: 'eagle', icon: '🦅' },
  { id: 'panda', icon: '🐼' },
  { id: 'fox', icon: '🦊' },
];
const PLAYER_EMOJIS = PLAYER_AVATARS.map(a => a.icon);
const TEAM_COLORS = ['#6C63FF', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#0ea5e9', '#d946ef', '#f59e0b'];
const TEAM_EMOJIS = ['🟣', '🟢', '🟠', '🔴', '🔵', '💜', '💛', '🔷'];
const CIRCUMFERENCE = 2 * Math.PI * 52;

/* =====================================================
   TRANSLATION STRINGS
   ===================================================== */
const PT = {
  he: {
    back: '← חזור',
    leave: '← עזוב חדר',
    leaveConfirm: 'לעזוב את החדר?',
    ptakimTitle: 'פתקים',
    ptakimSubtitle: 'כתבו שמות, נחשו ב-3 סיבובים!',
    createGame: 'צור/צרי משחק',
    joinGame: 'הצטרף/י למשחק',
    notesPerPlayer: 'פתקים לשחקן/ית',
    skipRule: 'דילוג',
    skipAllowed: 'מותר',
    skipNone: 'אסור',
    createRoom: 'צור/צרי חדר',
    roomCode: 'קוד חדר',
    roomCodeLabel: 'קוד',
    yourName: 'השם שלך',
    chooseAvatar: 'בחר/י דמות',
    join: 'הצטרף/י',
    players: 'שחקנים',
    waiting: 'ממתין/ה...',
    startGame: 'התחילו משחק!',
    writeNotes: 'כתיבת פתקים',
    notePlaceholder: 'שם של דמות/אישיות',
    shareWhatsapp: 'שתפו',
    shareMessage: 'הצטרפו למשחק פתקים שלי! קוד: {code}\n{url}',
    editName: '✏️ שנו שם',
    saveName: 'שמור',
    cancelEdit: 'ביטול',
    copyCode: '📋 העתק',
    copied: 'הועתק!',
    submitNote: 'הוסף →',
    submitNoteDone: 'סיום ✓',
    notesDoneTitle: 'סיימת לכתוב!',
    notesDoneSub: 'ממתינים לשאר השחקנים/ות',
    waitingForOthers: 'ממתינים לעוד {n} שחקנים/ות...',
    waitingForHost: 'ממתינים שהמארח/ת יתחיל/תתחיל...',
    needMorePlayers: 'צריך לפחות {n} שחקנים/ות',
    noteOf: 'פתק',
    of: 'מתוך',
    round: 'סיבוב',
    roundN: 'סיבוב',
    round1name: 'תיאור חופשי',
    round1desc: 'השתמשו בכמה מילים שתרצו כדי לתאר את השם בפתק.\nאסור לומר את השם עצמו!',
    round2name: 'מילה אחת',
    round2desc: 'מילה אחת בלבד לכל פתק.\nבחרו בחוכמה — אי אפשר לשנות!',
    round3name: 'פנטומימה',
    round3desc: 'אסור לדבר או להשמיע קול.\nרק תנועות גוף!',
    startRound: 'התחל/י סיבוב',
    startTurn: '▶ התחל/י תור',
    pauseTurn: '⏸ השהה',
    resumeTurn: '▶ המשך',
    paused: 'מושהה',
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
    deckEmpty: 'כל הפתקים נוחשו!',
    r1short: 'סיבוב 1', r2short: 'סיבוב 2', r3short: 'סיבוב 3',
    total: 'סה"כ',
    enterRoomCode: 'הכניסו קוד',
    enterName: 'הכניסו שם',
    invalidCode: 'קוד לא תקין (4 תווים)',
    roomNotFound: 'חדר לא נמצא',
    nameTaken: 'השם תפוס',
    gameStarted: 'המשחק כבר התחיל',
    shareCode: 'שתפו את הקוד:',
    editTeams: '✏️ ערוך קבוצות',
    shuffleTeams: '🔀 ערבב',
    addTeam: '+ קבוצה',
    removeTeam: '- הסר',
    doneEditing: 'סיום',
    tapToMove: 'הקישו על שחקן/ית להעברה',
    endGame: 'סיים',
    endGameConfirm: 'לסיים את המשחק?',
    yes: 'כן',
    no: 'לא',
    cancel: 'ביטול',
    timeUp: 'הזמן נגמר!',
    didTeamGuess: 'הקבוצה ניחשה את המילה האחרונה?',
    lastWord: 'מילה אחרונה',
    guessedIt: 'ניחשו ✓',
    didNotGuess: 'לא ניחשו ✗',
    waitingToStart: 'ממתינים שיתחיל/תתחיל',
    watching: 'צפייה',
    isPlaying: 'משחק/ת עכשיו',
    turnInProgress: 'משחק/ת עכשיו!',
    yourTurn: 'התור שלך!',
    notesCount: 'פתקים: {n}',
    createdTheRoom: 'יצרת חדר!',
    joinedRoom: 'הצטרפת!',
    settingsLabel: 'הגדרות',
    waitingRoom: 'חדר המתנה',
    teamSetup: 'חלוקה לקבוצות',
    viewOnlyTeamSetup: 'המארח/ת מחלק/ת קבוצות...',
    minTwoPerTeam: 'מינימום 2 שחקנים/ות בכל קבוצה',
    waitingForPlayer: 'ממתינים ש-{name} יתחיל/תתחיל...',
    selectTeams: 'בחירת קבוצות',
    dragToMove: 'גררו שחקנים/ות בין הקבוצות',
    nextTeam: 'הקבוצה הבאה',
    nextPlayerLabel: 'השחקן/ית',
    moveUp: 'מעלה',
    moveDown: 'מטה',
    yourTurnBig: 'התור שלך!',
    yourTurnSub: 'התכוננו — בקרוב תתחילו',
    randomAssign: 'חלוקה אקראית',
    removeFromTeam: 'הסר',
    unassignedEmpty: 'כל השחקנים/ות משובצים/ות',
  },
  en: {
    back: '← Back',
    leave: '← Leave room',
    leaveConfirm: 'Leave this room?',
    ptakimTitle: 'Ptakim',
    ptakimSubtitle: 'Write names, guess in 3 rounds!',
    createGame: 'Create Game',
    joinGame: 'Join Game',
    notesPerPlayer: 'Notes per player',
    skipRule: 'Skipping',
    skipAllowed: 'Allowed',
    skipNone: 'Not allowed',
    createRoom: 'Create Room',
    roomCode: 'Room Code',
    roomCodeLabel: 'Code',
    yourName: 'Your Name',
    chooseAvatar: 'Choose Avatar',
    join: 'Join',
    players: 'Players',
    waiting: 'Waiting...',
    startGame: 'Start Game!',
    writeNotes: 'Write Notes',
    notePlaceholder: 'Character or celebrity name',
    shareWhatsapp: 'Share',
    shareMessage: 'Join my Ptakim game! Code: {code}\n{url}',
    editName: '✏️ Edit name',
    saveName: 'Save',
    cancelEdit: 'Cancel',
    copyCode: '📋 Copy',
    copied: 'Copied!',
    submitNote: 'Add →',
    submitNoteDone: 'Done ✓',
    notesDoneTitle: 'You\'re done!',
    notesDoneSub: 'Waiting for other players',
    waitingForOthers: 'Waiting for {n} more player(s)...',
    waitingForHost: 'Waiting for host to start...',
    needMorePlayers: 'Need at least {n} players',
    noteOf: 'Note',
    of: 'of',
    round: 'Round',
    roundN: 'Round',
    round1name: 'Free Description',
    round1desc: 'Use as many words as you want.\nDon\'t say the actual name!',
    round2name: 'One Word',
    round2desc: 'Only one word per note.\nChoose wisely!',
    round3name: 'Pantomime',
    round3desc: 'No speaking or sounds.\nGestures only!',
    startRound: 'Start Round',
    startTurn: '▶ Start Turn',
    pauseTurn: '⏸ Pause',
    resumeTurn: '▶ Resume',
    paused: 'Paused',
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
    deckEmpty: 'All notes guessed!',
    r1short: 'Round 1', r2short: 'Round 2', r3short: 'Round 3',
    total: 'Total',
    enterRoomCode: 'Enter code',
    enterName: 'Enter your name',
    invalidCode: 'Invalid code (4 chars)',
    roomNotFound: 'Room not found',
    nameTaken: 'Name already taken',
    gameStarted: 'Game already started',
    shareCode: 'Share the code:',
    editTeams: '✏️ Edit Teams',
    shuffleTeams: '🔀 Shuffle',
    addTeam: '+ Team',
    removeTeam: '- Remove',
    doneEditing: 'Done',
    tapToMove: 'Tap a player to move them',
    endGame: 'End',
    endGameConfirm: 'End the game?',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    timeUp: 'Time\'s Up!',
    didTeamGuess: 'Did your team guess the last word?',
    lastWord: 'Last word',
    guessedIt: 'Guessed ✓',
    didNotGuess: 'Not guessed ✗',
    waitingToStart: 'Waiting to start',
    watching: 'Watching',
    isPlaying: 'is playing',
    turnInProgress: 'playing now!',
    yourTurn: 'Your turn!',
    notesCount: 'Notes: {n}',
    createdTheRoom: 'Room created!',
    joinedRoom: 'Joined!',
    settingsLabel: 'Settings',
    waitingRoom: 'Waiting Room',
    teamSetup: 'Team Setup',
    viewOnlyTeamSetup: 'The host is setting up teams...',
    minTwoPerTeam: 'Min 2 players per team',
    waitingForPlayer: 'Waiting for {name} to start...',
    selectTeams: 'Select Teams',
    dragToMove: 'Drag players between teams',
    nextTeam: 'Next team',
    nextPlayerLabel: 'Player',
    moveUp: 'Move up',
    moveDown: 'Move down',
    yourTurnBig: 'You\'re up!',
    yourTurnSub: 'Get ready — tap to start',
    randomAssign: 'Random',
    removeFromTeam: 'Unassign',
    unassignedEmpty: 'All players assigned',
  },
  es: {
    back: '← Volver',
    leave: '← Salir',
    leaveConfirm: '¿Salir de la sala?',
    ptakimTitle: 'Ptakim',
    ptakimSubtitle: 'Escribe nombres, adivina en 3 rondas!',
    createGame: 'Crear Juego',
    joinGame: 'Unirse',
    notesPerPlayer: 'Notas por jugador',
    skipRule: 'Saltar',
    skipAllowed: 'Permitido',
    skipNone: 'No permitido',
    createRoom: 'Crear Sala',
    roomCode: 'Código',
    roomCodeLabel: 'Código',
    yourName: 'Tu Nombre',
    chooseAvatar: 'Elige Avatar',
    join: 'Unirse',
    players: 'Jugadores',
    waiting: 'Esperando...',
    startGame: '¡Empezar!',
    writeNotes: 'Escribir Notas',
    notePlaceholder: 'Nombre de personaje',
    shareWhatsapp: 'Compartir',
    shareMessage: '¡Únete a mi juego de Ptakim! Código: {code}\n{url}',
    editName: '✏️ Cambiar nombre',
    saveName: 'Guardar',
    cancelEdit: 'Cancelar',
    copyCode: '📋 Copiar',
    copied: '¡Copiado!',
    submitNote: 'Añadir →',
    submitNoteDone: 'Listo ✓',
    notesDoneTitle: '¡Terminaste!',
    notesDoneSub: 'Esperando a los demás jugadores',
    waitingForOthers: 'Esperando a {n} jugador(es) más...',
    waitingForHost: 'Esperando al anfitrión...',
    needMorePlayers: 'Se necesitan al menos {n} jugadores',
    noteOf: 'Nota',
    of: 'de',
    round: 'Ronda',
    roundN: 'Ronda',
    round1name: 'Descripción Libre',
    round1desc: 'Usa todas las palabras.\n¡No digas el nombre!',
    round2name: 'Una Palabra',
    round2desc: 'Solo una palabra por nota.\n¡Elige bien!',
    round3name: 'Pantomima',
    round3desc: 'Sin hablar.\n¡Solo gestos!',
    startRound: 'Empezar Ronda',
    startTurn: '▶ Empezar Turno',
    pauseTurn: '⏸ Pausa',
    resumeTurn: '▶ Continuar',
    paused: 'Pausado',
    holdToReveal: 'Mantén para ver',
    correct: '✓ ¡Correcto!',
    skip: '↷ Saltar',
    turnResults: 'Resultado del Turno',
    guessed: 'Adivinados',
    skipped: 'Saltados',
    notes: 'notas',
    nextPlayer: 'Siguiente',
    roundResults: 'Resultado de Ronda',
    totalScore: 'Puntaje Total',
    nextRound: 'Siguiente Ronda →',
    gameOver: '¡Fin del Juego!',
    winner: '¡Los Ganadores!',
    finalScores: 'Puntajes Finales',
    playAgain: 'Jugar de Nuevo',
    backToMenu: 'Menú',
    team: 'Equipo',
    host: 'Anfitrión',
    you: 'Tú',
    deckEmpty: '¡Todas adivinadas!',
    r1short: 'Ronda 1', r2short: 'Ronda 2', r3short: 'Ronda 3',
    total: 'Total',
    enterRoomCode: 'Ingresa código',
    enterName: 'Ingresa tu nombre',
    invalidCode: 'Código inválido (4 caracteres)',
    roomNotFound: 'Sala no encontrada',
    nameTaken: 'Nombre ya en uso',
    gameStarted: 'El juego ya empezó',
    shareCode: 'Comparte el código:',
    editTeams: '✏️ Editar Equipos',
    shuffleTeams: '🔀 Mezclar',
    addTeam: '+ Equipo',
    removeTeam: '- Quitar',
    doneEditing: 'Listo',
    tapToMove: 'Toca un jugador para moverlo',
    endGame: 'Terminar',
    endGameConfirm: '¿Terminar el juego?',
    yes: 'Sí',
    no: 'No',
    cancel: 'Cancelar',
    timeUp: '¡Se acabó el tiempo!',
    didTeamGuess: '¿Tu equipo adivinó la última palabra?',
    lastWord: 'Última palabra',
    guessedIt: 'Adivinado ✓',
    didNotGuess: 'No adivinado ✗',
    waitingToStart: 'Esperando',
    watching: 'Viendo',
    isPlaying: 'está jugando',
    turnInProgress: '¡jugando ahora!',
    yourTurn: '¡Tu turno!',
    notesCount: 'Notas: {n}',
    createdTheRoom: '¡Sala creada!',
    joinedRoom: '¡Te uniste!',
    settingsLabel: 'Ajustes',
    waitingRoom: 'Sala de Espera',
    teamSetup: 'Configurar Equipos',
    viewOnlyTeamSetup: 'El anfitrión está armando equipos...',
    minTwoPerTeam: 'Mínimo 2 jugadores por equipo',
    waitingForPlayer: 'Esperando a {name}...',
    selectTeams: 'Elegir Equipos',
    dragToMove: 'Arrastra jugadores entre equipos',
    nextTeam: 'Siguiente equipo',
    nextPlayerLabel: 'Jugador',
    moveUp: 'Subir',
    moveDown: 'Bajar',
    yourTurnBig: '¡Tu turno!',
    yourTurnSub: 'Prepárate — toca para empezar',
    randomAssign: 'Aleatorio',
    removeFromTeam: 'Quitar',
    unassignedEmpty: 'Todos los jugadores asignados',
  }
};

function t(key, vars) {
  const lang = (window.G && window.G.uiLang) || 'he';
  let s = (PT[lang] && PT[lang][key]) || (PT.en && PT.en[key]) || key;
  if (vars) Object.keys(vars).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
  return s;
}

/* =====================================================
   STATE
   ===================================================== */
let P = {
  screen: 'ptakimHome',
  deviceId: localStorage.getItem('ptakim_device_id') || generateDeviceId(),
  playerName: localStorage.getItem('ptakim_player_name') || '',
  playerAvatar: localStorage.getItem('ptakim_player_avatar') || PLAYER_AVATARS[Math.floor(Math.random() * PLAYER_AVATARS.length)].icon,
  setupMode: 'create', // 'create' | 'join'
  roomCode: null,
  isHost: false,
  joined: false,
  settings: {
    notesPerPlayer: 5,
    skipAllowed: true,
    teamMode: 'auto',
  },
  room: null,
  noteInputs: [],
  notesSubmitted: 0,
  localTimer: null,
  timeLeft: 0,
  noteVisibility: 'hidden',
  autoRevealTimeout: null,
  turnCorrect: 0,
  turnSkipped: 0,
  clockOffset: 0,
  _currentNoteText: null,
  _pendingSubmit: false, // prevent double-submit
  _mockDrive: null, // token preventing duplicate mock-turn auto-drives
};

function isMockDevice(did) {
  return typeof did === 'string' && did.startsWith('mock_');
}

function generateDeviceId() {
  const id = 'ptk_' + Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
  localStorage.setItem('ptakim_device_id', id);
  return id;
}

/* =====================================================
   STATE PERSISTENCE
   ===================================================== */
const PTAKIM_STATE_KEY = 'ptakim_game_state';
const LEGACY_SCREEN_MAP = {
  ptakimCreate: 'ptakimHome',
  ptakimJoin: 'ptakimHome',
  ptakimLobby: 'ptakimWait',
  ptakimRoom: 'ptakimNotes',
};

function saveGameState() {
  if (!P.roomCode) {
    localStorage.removeItem(PTAKIM_STATE_KEY);
    return;
  }
  // Don't persist finished or ended games — we don't want to restore them
  // next time the user opens the app.
  const phase = P.room?.phase;
  if (phase === 'game_finished' || phase === 'game_ended' || phase === 'ended' || phase === 'cancelled') {
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
    if (Date.now() - state.savedAt > 2 * 60 * 60 * 1000) {
      localStorage.removeItem(PTAKIM_STATE_KEY);
      return false;
    }
    // Never restore a finished/ended game
    const phase = state.room?.phase;
    if (phase === 'game_finished' || phase === 'game_ended' || phase === 'ended' || phase === 'cancelled') {
      localStorage.removeItem(PTAKIM_STATE_KEY);
      return false;
    }
    // Never restore straight to the Final screen
    if (state.screen === 'ptakimFinal') {
      localStorage.removeItem(PTAKIM_STATE_KEY);
      return false;
    }
    P.screen = LEGACY_SCREEN_MAP[state.screen] || state.screen || 'ptakimHome';
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
   ROOM STATE NORMALIZATION
   ===================================================== */
function normalizeRoom(raw) {
  if (!raw) return null;
  if (raw.roomCode !== undefined) return raw; // already normalized
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
      paused: !!raw.current_turn.paused,
      pausedRemainingMs: raw.current_turn.paused_remaining_ms || 0,
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

/* =====================================================
   REALTIME SUBSCRIPTION
   ===================================================== */
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

function applyRoomUpdate(raw) {
  if (!raw) return;
  if (raw.phase === 'game_ended' || raw.phase === 'ended' || raw.phase === 'cancelled') {
    forceEndGame();
    return;
  }

  const id = P.room?.id;
  const oldPhase = P.room?.phase;
  const oldTurnStartTime = P.room?.currentTurn?.startTime;
  const oldPaused = !!P.room?.currentTurn?.paused;
  const newRoom = normalizeRoom(raw);
  if (id) newRoom.id = id;
  else if (raw.id) newRoom.id = raw.id;

  const newHash = roomHash(newRoom);
  if (newHash === _lastRoomHash) return;
  // Also suppress if the new state matches what we already have in P.room.
  // This filters server echoes of our own writes (same content, different event).
  const localHash = roomHash(P.room);
  if (newHash === localHash) return;
  _lastRoomHash = newHash;
  // Reset mock-drive token whenever the turn signature changes so the next
  // turn's drive can fire (tokens are scoped to team+player+round).
  const sig = (newRoom.currentTurn ? `${newRoom.currentTurn.teamIdx}_${newRoom.currentTurn.playerIdx}` : '') + '_' + (newRoom.currentRound || 0);
  if (P._mockDriveSig !== sig) { P._mockDrive = null; P._mockDriveSig = sig; }

  // CLOCK-SKEW FIX — Base44 has no central server timestamp; every client
  // stamps start/end using their own Date.now(). Spectators' clocks may be off.
  // When we first see a turn become active (new startTime), overwrite endTime
  // with OUR OWN Date.now() + TURN_SECONDS so the timer stays sensible on this
  // device regardless of the writer's clock skew.
  if (newRoom.currentTurn?.startTime && newRoom.currentTurn.startTime !== oldTurnStartTime && newRoom.phase === 'turn_active') {
    newRoom.currentTurn.endTime = Date.now() + TURN_SECONDS * 1000;
  }

  P.room = newRoom;
  saveGameState();

  // Start spectator timer when turn begins. Using our own Date.now()-based
  // endTime (rewritten above) sidesteps cross-device clock skew.
  const newTurnStartTime = newRoom.currentTurn?.startTime;
  if (newTurnStartTime && newTurnStartTime !== oldTurnStartTime && newRoom.phase === 'turn_active') {
    startLocalTimer(false);
  }

  if (window.G && window.G.screen && window.G.screen.startsWith('ptakim')) {
    const expected = expectedScreenForPhase(newRoom.phase);
    if (newRoom.phase !== oldPhase || (expected && P.screen !== expected)) {
      navigateByPhase();
    } else {
      // Don't full-rerender the Playing screen on every update — it causes
      // visible flicker during rapid guesses. The active player's UI is driven
      // by local state (counters, note text) and patched in-place by
      // handleTurnAction; spectators update their UI via startLocalTimer ticks.
      if (P.screen === 'ptakimPlaying') {
        // Full re-render needed when the waiting-card → timer transition fires,
        // or when pause state flips (buttons and labels change).
        const newPaused = !!newRoom.currentTurn?.paused;
        if ((newTurnStartTime && newTurnStartTime !== oldTurnStartTime) || newPaused !== oldPaused) {
          ptkRender();
          // Resume: restart local timer so ticks resume against the new endTime.
          if (oldPaused && !newPaused) startLocalTimer(isActivePlayer());
        } else {
          updatePlayingCounters();
        }
      } else if (P.screen === 'ptakimTeamSetup' && window._ptkDragging) {
        // Skip re-render mid-drag so pointer capture isn't destroyed.
      } else {
        ptkRender();
      }
    }
  }
}

function expectedScreenForPhase(phase) {
  if (!phase) return null;
  if (phase === 'game_ended' || phase === 'ended' || phase === 'cancelled') return 'modeSelect';
  const total = P.room?.settings?.notesPerPlayer || P.settings.notesPerPlayer;
  const myNotesDone = P.notesSubmitted >= total;
  const lobbyTarget = myNotesDone ? 'ptakimWait' : 'ptakimNotes';
  return {
    lobby: lobbyTarget,
    submitting_notes: lobbyTarget,
    team_setup: 'ptakimTeamSetup',
    round_intro: 'ptakimRoundIntro',
    turn_active: 'ptakimPlaying',
    turn_result: 'ptakimTurnResult',
    round_result: 'ptakimRoundResult',
    game_finished: 'ptakimFinal',
  }[phase] || null;
}

function subscribeToRoom() {
  if (!api.isOnline() || !P.roomCode) return;
  if (_unsubscribe) _unsubscribe();
  _lastRoomHash = roomHash(P.room);

  // Track last-received subscription event. Poll whenever it's been quiet.
  // Subscriptions can silently drop (websocket disconnects); without continuous
  // polling the client stalls and never sees server-side phase transitions.
  let lastSubEventAt = 0;
  if (P.room && P.room.id) {
    _unsubscribe = api.subscribeToRoom(P.room.id, (data) => {
      lastSubEventAt = Date.now();
      applyRoomUpdate(data);
    });
  }

  clearInterval(_pollInterval);
  _pollInterval = setInterval(async () => {
    if (!P.roomCode || !api.isOnline()) { clearInterval(_pollInterval); return; }
    // Skip this tick only if a subscription event arrived very recently.
    // Otherwise poll — so a silently-dropped subscription still gets updates.
    if (Date.now() - lastSubEventAt < 2500) return;
    const raw = await api.getRoom(P.roomCode);
    if (raw) applyRoomUpdate(raw);
  }, 3000);
}

/* =====================================================
   API WRAPPER
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
  const lng = lang();
  if (lng === 'he') return 'שחקן 1';
  if (lng === 'es') return 'Jugador 1';
  return 'Player 1';
}

/* =====================================================
   GAME LOGIC (offline / fallback helpers)
   ===================================================== */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function serverNow() {
  return Date.now() + (P.clockOffset || 0);
}

function startTurn() {
  if (!P.room) return;
  const turn = P.room.currentTurn;
  if (!turn) return;
  if (!turn.startTime) {
    turn.startTime = Date.now();
    turn.endTime = Date.now() + TURN_SECONDS * 1000;
  }
  P.turnCorrect = 0;
  P.turnSkipped = 0;
  P.noteVisibility = 'hidden';
  P.room.phase = 'turn_active';
  startLocalTimer(true);
  showAutoReveal();
  ptkRender();
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.frequency.value = 830; osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.start(now); osc1.stop(now + 0.5);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.frequency.value = 622; osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.4, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.start(now + 0.3); osc2.stop(now + 0.9);
  } catch (_) {}
}

function playSoftTick() {
  // Warm sine pip ~440Hz, ~120ms — pleasant, not stressful
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (_) {}
}

function startLocalTimer(autoEnd = false) {
  clearInterval(P.localTimer);
  const endTime = P.room?.currentTurn?.endTime;
  const compute = () => {
    if (P.room?.currentTurn?.paused) {
      return Math.max(0, Math.min(TURN_SECONDS, Math.ceil((P.room.currentTurn.pausedRemainingMs || 0) / 1000)));
    }
    if (!endTime) return TURN_SECONDS;
    const rawSec = Math.ceil((endTime - Date.now()) / 1000);
    return Math.max(0, Math.min(TURN_SECONDS, rawSec));
  };
  P.timeLeft = compute();
  let lastTickSecond = -1;
  P.localTimer = setInterval(() => {
    if (!P.room || !P.room.currentTurn) return;
    if (P.room.currentTurn.paused) {
      // Hold the display at the frozen remaining time; don't tick down.
      P.timeLeft = Math.max(0, Math.min(TURN_SECONDS, Math.ceil((P.room.currentTurn.pausedRemainingMs || 0) / 1000)));
      return;
    }
    if (!P.room.currentTurn.endTime) return;
    const remaining = Math.max(0, Math.min(TURN_SECONDS, Math.ceil((P.room.currentTurn.endTime - Date.now()) / 1000)));
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
    // Soft pre-end beeps at 3, 2, 1 (once per second)
    if (remaining > 0 && remaining <= 3 && remaining !== lastTickSecond) {
      lastTickSecond = remaining;
      playSoftTick();
    }
    if (remaining <= 0) {
      clearInterval(P.localTimer);
      playBeep();
      if (autoEnd) showTurnEndConfirm();
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
  const deckSize = P.room.deck?.length || P.room.noteCount || 0;
  const deckIdx = P.room.deckIndex || 0;
  if (deckSize > 0 && deckIdx >= deckSize) return null;
  if (api.isOnline()) {
    if (P._currentNoteText) return { text: P._currentNoteText };
    if (deckSize > 0 && deckIdx < deckSize) return { text: '...', loading: true };
    return null;
  }
  const noteIdx = P.room.deck[P.room.deckIndex];
  return P.room.notes[noteIdx] || null;
}

function handleCorrect() {
  if (!P.room) return;
  P.turnCorrect++;
  P.room.deckIndex++;
  if (P.room.deckIndex >= P.room.deck.length) { endTurn(true); return; }
  P.noteVisibility = 'hidden';
  flashCard('correct');
  showAutoReveal();
  ptkRender();
}

function handleSkip() {
  if (!P.room || !P.room.settings.skipAllowed) return;
  P.turnSkipped++;
  const currentIdx = P.room.deck[P.room.deckIndex];
  P.room.deck.push(currentIdx);
  P.room.deckIndex++;
  if (P.room.deckIndex >= P.room.deck.length) { endTurn(true); return; }
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
    await doAction('end_turn', { turnCorrect: P.turnCorrect, turnSkipped: P.turnSkipped });
  } else if (!api.isOnline()) {
    const roundIdx = P.room.currentRound - 1;
    P.room.teams[turn.teamIdx].scores[roundIdx] += P.turnCorrect;
    P.room.turnResults = {
      teamIdx: turn.teamIdx, playerIdx: turn.playerIdx,
      correct: P.turnCorrect, skipped: P.turnSkipped, deckEmpty: !!deckEmpty,
    };
    if (deckEmpty || P.room.deckIndex >= P.room.deck.length) {
      if (P.room.currentRound >= 3) {
        P.room.phase = 'game_finished';
        ptkGoto('ptakimFinal');
      } else {
        P.room.phase = 'round_result';
        ptkGoto('ptakimRoundResult');
      }
    } else {
      P.room.phase = 'turn_result';
      ptkGoto('ptakimTurnResult');
    }
  }
}

function advanceToNextTurn() {
  if (!P.room || !P.room.currentTurn) return;
  const turn = P.room.currentTurn;
  const nextTeamIdx = (turn.teamIdx + 1) % P.room.teams.length;
  const nextTeam = P.room.teams[nextTeamIdx];
  if (nextTeamIdx <= turn.teamIdx) {
    P.room.teams.forEach(team => { team.explainerIdx = (team.explainerIdx + 1) % team.players.length; });
  }
  P.room.currentTurn = {
    teamIdx: nextTeamIdx, playerIdx: nextTeam.explainerIdx,
    startTime: null, endTime: null,
  };
  P.turnCorrect = 0; P.turnSkipped = 0;
  P.room.phase = 'turn_active';
  ptkRender();
}

function advanceToNextRound() {
  if (!P.room) return;
  const nextRound = P.room.currentRound + 1;
  if (nextRound > 3) { P.room.phase = 'game_finished'; ptkRender(); return; }
  P.room.currentRound = nextRound;
  const noteIndices = P.room.notes.map((_, i) => i);
  P.room.deck = shuffleArray(noteIndices);
  P.room.deckIndex = 0;
  P.room.currentTurn = null;
  P.room.phase = 'round_intro';
  ptkRender();
}

function getTeamTotalScore(teamIdx) {
  if (!P.room || !P.room.teams[teamIdx]) return 0;
  return P.room.teams[teamIdx].scores.reduce((a, b) => a + b, 0);
}

function getWinnerTeamIdx() {
  if (!P.room) return 0;
  let maxScore = -1, winnerIdx = 0;
  P.room.teams.forEach((team, i) => {
    const total = getTeamTotalScore(i);
    if (total > maxScore) { maxScore = total; winnerIdx = i; }
  });
  return winnerIdx;
}

function isActivePlayer() {
  if (!P.room || !P.room.currentTurn || !P.room.teams) return false;
  const turn = P.room.currentTurn;
  const team = P.room.teams[turn.teamIdx];
  if (!team) return false;
  const playerDeviceId = team.playerDeviceIds?.[turn.playerIdx];
  return playerDeviceId === P.deviceId;
}

function activePlayerDeviceId() {
  if (!P.room?.currentTurn?.teamIdx === undefined || !P.room?.teams) return null;
  const turn = P.room.currentTurn;
  const team = P.room.teams[turn.teamIdx];
  return team?.playerDeviceIds?.[turn.playerIdx] || null;
}

function isMockActivePlayer() {
  return isMockDevice(activePlayerDeviceId());
}

/* =====================================================
   MOCK AUTO-DRIVE
   When the active player is a "mock_" device, the host auto-advances
   the game so it doesn't stall. Mock turns are short (~2s) and score
   a small number of correct guesses automatically.
   ===================================================== */
const MOCK_TURN_MS = 2000;
const MOCK_RESULT_DELAY_MS = 700;

async function driveMockTurn() {
  if (!P.isHost) return;
  if (!P.room || !P.room.currentTurn) return;
  if (!isMockActivePlayer()) return;
  if (P.room.phase !== 'turn_active') return;

  const token = 'mock_' + P.room.currentTurn.teamIdx + '_' + P.room.currentTurn.playerIdx + '_' + P.room.currentRound;
  if (P._mockDrive === token) return;
  P._mockDrive = token;

  // Step 1: start the turn (sets start/end timestamps on server)
  if (!P.room.currentTurn.startTime) {
    if (api.isOnline()) {
      await doAction('start_turn');
      // Override the 60s end time to a 2s mock turn so everyone sees the fast clock
      if (P.room.currentTurn) {
        const now = Date.now();
        P.room.currentTurn.startTime = now;
        P.room.currentTurn.endTime = now + MOCK_TURN_MS;
      }
    } else {
      P.room.currentTurn.startTime = Date.now();
      P.room.currentTurn.endTime = Date.now() + MOCK_TURN_MS;
      P.room.phase = 'turn_active';
    }
    // Re-render Playing screen to show the running clock
    if (P.screen === 'ptakimPlaying') ptkRender();
  }

  // Step 2: score 1-3 correct notes over ~MOCK_TURN_MS
  const randomCorrect = 1 + Math.floor(Math.random() * 3);
  P.turnCorrect = randomCorrect;
  P.turnSkipped = 0;

  await new Promise(r => setTimeout(r, MOCK_TURN_MS + MOCK_RESULT_DELAY_MS));
  if (P._mockDrive !== token) return; // superseded

  // Step 3: end the turn
  if (api.isOnline()) {
    await doAction('end_turn', {
      turnCorrect: P.turnCorrect,
      turnSkipped: P.turnSkipped,
      lastWordGuessed: false,
    });
    // Server transitions phase → turn_result | round_result; subscription navigates.
  } else {
    // Offline fallback
    const roundIdx = P.room.currentRound - 1;
    P.room.teams[P.room.currentTurn.teamIdx].scores[roundIdx] += P.turnCorrect;
    P.room.turnResults = {
      teamIdx: P.room.currentTurn.teamIdx,
      playerIdx: P.room.currentTurn.playerIdx,
      correct: P.turnCorrect,
      skipped: 0,
      deckEmpty: false,
    };
    P.room.phase = 'turn_result';
    ptkGoto('ptakimTurnResult');
  }
}

async function driveMockNextTurn() {
  if (!P.isHost) return;
  if (!P.room || P.room.phase !== 'turn_result') return;
  if (!P.room.turnResults) return;
  // Is the NEXT player a mock?
  const teams = P.room.teams;
  const res = P.room.turnResults;
  const nextTeamIdx = (res.teamIdx + 1) % teams.length;
  const wrappedRound = nextTeamIdx <= res.teamIdx;
  const nextTeam = teams[nextTeamIdx];
  const nextExplainerIdx = wrappedRound
    ? (nextTeam.explainerIdx + 1) % (nextTeam.players.length || 1)
    : nextTeam.explainerIdx;
  const nextDeviceId = nextTeam.playerDeviceIds?.[nextExplainerIdx];
  if (!isMockDevice(nextDeviceId)) return;

  const token = 'mockn_' + nextTeamIdx + '_' + nextExplainerIdx + '_' + P.room.currentRound;
  if (P._mockDrive === token) return;
  P._mockDrive = token;

  // Brief delay so the result is visible
  await new Promise(r => setTimeout(r, MOCK_RESULT_DELAY_MS));
  if (P._mockDrive !== token) return;

  if (api.isOnline()) {
    await doAction('next_turn');
  } else {
    advanceToNextTurn();
  }
  // navigation will happen via subscription or offline advance
}

function navigateByPhase() {
  if (!P.room) return;
  const phase = P.room.phase;
  if (phase === 'game_ended' || phase === 'ended' || phase === 'cancelled') {
    forceEndGame();
    return;
  }
  // In lobby phase, the target depends on whether the current user has finished notes:
  //   notes incomplete → ptakimNotes (writing)
  //   notes complete   → ptakimWait (waiting room)
  const total = P.room.settings?.notesPerPlayer || P.settings.notesPerPlayer;
  const myNotesDone = P.notesSubmitted >= total;
  const lobbyTarget = myNotesDone ? 'ptakimWait' : 'ptakimNotes';
  const screenMap = {
    lobby: lobbyTarget,
    submitting_notes: lobbyTarget, // legacy
    team_setup: 'ptakimTeamSetup',
    round_intro: 'ptakimRoundIntro',
    turn_active: 'ptakimPlaying',
    turn_result: 'ptakimTurnResult',
    round_result: 'ptakimRoundResult',
    game_finished: 'ptakimFinal',
  };
  const target = screenMap[phase];
  if (!target) return;

  if (phase === 'turn_active' && !isActivePlayer()) {
    if (P.room.currentTurn?.endTime) startLocalTimer(false);
  }
  if (P.screen !== target) ptkGoto(target);
}

/* =====================================================
   RENDER DISPATCHER
   ===================================================== */
function ptkRender() {
  const app = document.getElementById('app');
  if (!app) return;
  const screens = {
    ptakimHome: renderPtakimHome,
    ptakimSetup: renderPtakimSetup,
    ptakimNotes: renderPtakimNotes,
    ptakimWait: renderPtakimWait,
    ptakimTeamSetup: renderPtakimTeamSetup,
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
  // Leaving team-setup → clear any in-flight drag so later renders aren't blocked,
  // and tear down the window-level DnD listeners so they don't leak.
  if (P.screen === 'ptakimTeamSetup' && screen !== 'ptakimTeamSetup') {
    window._ptkDragging = false;
    if (window._ptkDndCleanup) { window._ptkDndCleanup(); window._ptkDndCleanup = null; }
    // Kill any orphan ghost elements just in case
    document.querySelectorAll('.ptk-dnd-ghost').forEach(g => g.remove());
  }
  P.screen = screen;
  saveGameState();
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
   SCREEN: HOME (unchanged)
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
  document.getElementById('ptk-create-btn').onclick = () => { P.setupMode = 'create'; ptkGoto('ptakimSetup'); };
  document.getElementById('ptk-join-btn').onclick = () => { P.setupMode = 'join'; ptkGoto('ptakimSetup'); };
}

/* =====================================================
   SCREEN: SETUP (merged create+join)
   ===================================================== */
function renderPtakimSetup(app) {
  const isCreate = P.setupMode === 'create';
  const icon = isCreate ? '🎲' : '🔗';
  const title = isCreate ? t('createGame') : t('joinGame');
  const primaryLabel = isCreate ? t('createRoom') + ' →' : t('join') + ' →';
  const s = P.settings;

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:flex-start;padding-top:56px;">
        <button class="btn-ghost" id="ptk-setup-back" style="position:absolute;top:16px;${lang()==='he'?'right':'left'}:16px;z-index:1;">
          ${t('back')}
        </button>

        <div style="text-align:center;margin-bottom:20px;">
          <div class="ptk-create-icon">${icon}</div>
          <div style="font-size:1.5rem;font-weight:800;">${title}</div>
        </div>

        ${!isCreate ? `
          <div class="ptk-code-input-wrap">
            <input class="ptk-code-input" id="ptk-setup-code" placeholder="ABCD" maxlength="4"
              autocomplete="off" autocapitalize="characters" inputmode="text">
          </div>
        ` : ''}

        <div class="ptk-field" style="width:100%;">
          <label class="ptk-label">${t('yourName')}</label>
          <div class="ptk-identity-card">
            <div class="ptk-identity-avatar">
              <div class="ptk-selected-avatar">${P.playerAvatar}</div>
              <button class="ptk-change-avatar" id="ptk-change-avatar" type="button">✏️</button>
            </div>
            <input class="ptk-identity-name" id="ptk-setup-name" value="${escHtml(P.playerName)}" placeholder="${t('enterName')}" maxlength="20">
          </div>
        </div>

        <div class="ptk-avatar-picker" id="ptk-avatar-picker" style="display:none;">
          <div class="ptk-avatar-grid-compact">
            ${PLAYER_AVATARS.map(a => `
              <button class="ptk-avatar-btn-small ${P.playerAvatar === a.icon ? 'selected' : ''}" data-avatar="${a.icon}" type="button">
                ${a.icon}
              </button>
            `).join('')}
          </div>
        </div>

        ${isCreate ? `
          <div class="ptk-settings-card" style="margin-top:16px;">
            <div class="ptk-settings-row">
              <span class="ptk-settings-label">📝 ${t('notesPerPlayer')}</span>
              <div class="ptk-chips-inline">
                ${[3,4,5,6,7].map(n => `
                  <button class="ptk-chip-small ${s.notesPerPlayer===n?'active':''}" data-notes="${n}" type="button">${n}</button>
                `).join('')}
              </div>
            </div>
            <div class="ptk-settings-row">
              <span class="ptk-settings-label">↷ ${t('skipRule')}</span>
              <button class="ptk-toggle-small ${s.skipAllowed?'on':''}" id="ptk-skip-toggle" type="button">
                <span class="ptk-toggle-label">${s.skipAllowed ? t('skipAllowed') : t('skipNone')}</span>
              </button>
            </div>
          </div>
        ` : ''}

        <div id="ptk-setup-error" style="color:#dc2626;font-size:0.88rem;min-height:22px;margin-top:12px;text-align:center;"></div>

        <button class="btn btn-primary" id="ptk-setup-submit" style="margin-top:8px;">
          ${primaryLabel}
        </button>
      </div>
    </div>
  `;

  document.getElementById('ptk-setup-back').onclick = () => ptkGoto('ptakimHome');

  // Avatar picker
  const avatarPicker = document.getElementById('ptk-avatar-picker');
  document.getElementById('ptk-change-avatar').onclick = () => {
    avatarPicker.style.display = avatarPicker.style.display === 'none' ? 'block' : 'none';
  };
  document.querySelectorAll('[data-avatar]').forEach(btn => {
    btn.onclick = () => {
      P.playerAvatar = btn.dataset.avatar;
      localStorage.setItem('ptakim_player_avatar', P.playerAvatar);
      ptkGoto('ptakimSetup');
    };
  });

  if (isCreate) {
    document.querySelectorAll('[data-notes]').forEach(btn => {
      btn.onclick = () => {
        s.notesPerPlayer = parseInt(btn.dataset.notes);
        ptkGoto('ptakimSetup');
      };
    });
    document.getElementById('ptk-skip-toggle').onclick = () => {
      s.skipAllowed = !s.skipAllowed;
      ptkGoto('ptakimSetup');
    };
  } else {
    // Auto-focus code input on join
    setTimeout(() => {
      const codeInput = document.getElementById('ptk-setup-code');
      if (codeInput) codeInput.focus();
    }, 100);
  }

  document.getElementById('ptk-setup-submit').onclick = async () => {
    const nameInput = document.getElementById('ptk-setup-name');
    const errorEl = document.getElementById('ptk-setup-error');
    const btn = document.getElementById('ptk-setup-submit');
    errorEl.textContent = '';

    const name = (nameInput.value || '').trim();
    if (!name) {
      errorEl.textContent = t('enterName');
      nameInput.focus();
      return;
    }

    btn.disabled = true;
    btn.style.opacity = '0.6';

    // Wipe any lingering room/subscription/saved state from a previous session
    // so the new create/join starts clean. Keeps identity (name/avatar/deviceId).
    cleanupRoom();

    if (isCreate) {
      P.playerName = name;
      localStorage.setItem('ptakim_player_name', name);
      if (api.isOnline()) {
        const result = await api.createRoom(P.deviceId, P.playerName, P.settings);
        if (!result || !result.success) {
          btn.disabled = false; btn.style.opacity = '1';
          errorEl.textContent = 'Failed to create room';
          return;
        }
        P.roomCode = result.roomCode;
        P.isHost = true;
        P.joined = true;
        P.room = normalizeRoom(result.room);
        if (P.room) P.room.id = result.roomId || result.room?.id;
        P.notesSubmitted = 0;
        P.noteInputs = [];
        subscribeToRoom();
      } else {
        createMockRoom();
        P.joined = true;
      }
      ptkGoto('ptakimNotes');
    } else {
      // Join mode — immediately join the room so others see them
      const codeInput = document.getElementById('ptk-setup-code');
      const code = (codeInput.value || '').trim().toUpperCase();
      if (code.length !== 4) {
        btn.disabled = false; btn.style.opacity = '1';
        errorEl.textContent = t('invalidCode');
        codeInput.focus();
        return;
      }

      P.playerName = name;
      localStorage.setItem('ptakim_player_name', name);

      if (api.isOnline()) {
        const result = await api.joinRoom(code, P.deviceId, P.playerName);
        if (!result || !result.success) {
          btn.disabled = false; btn.style.opacity = '1';
          const err = result?.error || 'failed';
          if (err === 'Room not found') errorEl.textContent = t('roomNotFound');
          else if (err === 'Game already started') errorEl.textContent = t('gameStarted');
          else if (err === 'Name already taken') errorEl.textContent = t('nameTaken');
          else errorEl.textContent = err;
          return;
        }
        P.roomCode = code;
        P.isHost = result.room.host_device_id === P.deviceId;
        P.joined = true;
        P.room = normalizeRoom(result.room);
        if (P.room) P.room.id = result.roomId;
        P.notesSubmitted = 0;
        P.noteInputs = [];
        subscribeToRoom();
      } else {
        if (!P.room || P.room.roomCode !== code) {
          btn.disabled = false; btn.style.opacity = '1';
          errorEl.textContent = t('roomNotFound');
          return;
        }
        P.roomCode = code;
        P.isHost = false;
        P.joined = true;
        P.notesSubmitted = 0;
        P.noteInputs = [];
      }
      ptkGoto('ptakimNotes');
    }
  };
}

function createMockRoom() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
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
      emoji: P.playerAvatar,
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
  P.notesSubmitted = 0;
  P.noteInputs = [];
}

/* =====================================================
   Shared helpers for Notes and Wait screens
   ===================================================== */
function renderRoomCodeHero(room) {
  return `
    <div class="ptk-room-code-hero">
      <div class="ptk-room-code-hero-label">${t('shareCode')}</div>
      <div class="ptk-room-code-hero-value" id="ptk-room-code-value">${room.roomCode}</div>
      <div class="ptk-share-row">
        <button id="ptk-copy-code" class="ptk-copy-btn" type="button">${t('copyCode')}</button>
        <button id="ptk-share-whatsapp" class="ptk-share-whatsapp-btn" type="button">
          <span class="ptk-wa-icon">🟢</span> ${t('shareWhatsapp')}
        </button>
      </div>
    </div>
  `;
}

function wireCodeShareHandlers(room) {
  const copyBtn = document.getElementById('ptk-copy-code');
  if (copyBtn) {
    copyBtn.onclick = () => {
      copyToClipboard(room.roomCode);
      copyBtn.textContent = '✓ ' + t('copied');
      setTimeout(() => { if (copyBtn) copyBtn.textContent = t('copyCode'); }, 1500);
    };
  }
  const codeValue = document.getElementById('ptk-room-code-value');
  if (codeValue) {
    codeValue.onclick = () => {
      copyToClipboard(room.roomCode);
      codeValue.classList.add('ptk-copied-flash');
      setTimeout(() => codeValue.classList.remove('ptk-copied-flash'), 600);
    };
  }
  const shareBtn = document.getElementById('ptk-share-whatsapp');
  if (shareBtn) shareBtn.onclick = () => shareOnWhatsapp(room.roomCode);
}

function renderPlayerChips(room) {
  const players = room.players || [];
  return `
    <div class="ptk-players-bar">
      ${players.map((p, i) => {
        const isMe = p.deviceId === P.deviceId;
        const isDone = p.notesSubmitted;
        const isHostBadge = p.deviceId === room.hostDeviceId;
        return `
          <div class="ptk-player-chip ${isDone ? 'done' : 'writing'} ${isMe ? 'me' : ''}">
            <span class="ptk-player-chip-emoji">${p.emoji || PLAYER_EMOJIS[i % PLAYER_EMOJIS.length]}</span>
            <span class="ptk-player-chip-name">${escHtml(p.name)}${isHostBadge ? ' 👑' : ''}</span>
            <span class="ptk-player-chip-status">${isDone ? '✓' : '✏️'}</span>
            ${isMe ? `<button class="ptk-chip-edit" id="ptk-chip-edit" type="button" title="${t('editName')}">✏️</button>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function wireLeaveButton() {
  const leaveBtn = document.getElementById('ptk-room-leave');
  if (leaveBtn) {
    leaveBtn.onclick = () => {
      showConfirmModal(t('leaveConfirm'), () => {
        cleanupRoom();
        ptkGoto('ptakimHome');
      });
    };
  }
  const nameEditBtn = document.getElementById('ptk-chip-edit');
  if (nameEditBtn) {
    nameEditBtn.onclick = (e) => { e.stopPropagation(); showEditNameModal(); };
  }
}

/* =====================================================
   SCREEN: NOTES (writing only)
   ===================================================== */
function renderPtakimNotes(app) {
  if (!P.roomCode || !P.room) { ptkGoto('ptakimHome'); return; }
  const room = P.room;
  const total = room.settings?.notesPerPlayer || P.settings.notesPerPlayer;
  const mySubmitted = P.notesSubmitted;

  // Already done → go to waiting room
  if (mySubmitted >= total) {
    ptkGoto('ptakimWait');
    return;
  }

  if (api.isOnline() && !_unsubscribe) subscribeToRoom();

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner ptk-room-inner">
        <div class="ptk-room-header">
          <button class="btn-ghost" id="ptk-room-leave">${t('leave')}</button>
          <div class="ptk-room-header-title">${t('writeNotes')}</div>
        </div>

        ${renderRoomCodeHero(room)}

        <div class="ptk-section-label">${t('players')} · ${room.players.length}</div>
        ${renderPlayerChips(room)}

        <div class="ptk-section-label" style="margin-top:16px;">${t('writeNotes')}</div>
        <div class="ptk-write-section">
          <div class="ptk-note-counter">${t('noteOf')} ${mySubmitted + 1} ${t('of')} ${total}</div>
          <div class="ptk-note-progress">
            <div class="ptk-note-progress-fill" style="width:${(mySubmitted/total)*100}%;"></div>
          </div>
          <div class="ptk-sticky-note">
            <textarea class="ptk-sticky-note-input" id="ptk-note-input"
              placeholder="${t('notePlaceholder')}"
              maxlength="40" autocomplete="off" rows="2"></textarea>
            <button class="ptk-sticky-note-btn" id="ptk-submit-note" type="button">
              ${mySubmitted + 1 >= total ? t('submitNoteDone') : t('submitNote')}
            </button>
          </div>
          ${P.noteInputs.length > 0 ? `
            <div class="ptk-submitted-notes">
              ${P.noteInputs.map(() => `<div class="ptk-mini-note ptk-mini-note-hidden">✓</div>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  wireLeaveButton();
  wireCodeShareHandlers(room);

  const input = document.getElementById('ptk-note-input');
  const submitBtn = document.getElementById('ptk-submit-note');
  if (input) {
    setTimeout(() => input.focus(), 100);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSubmitNote(input); }
    });
  }
  if (submitBtn) submitBtn.onclick = () => doSubmitNote(input);
}

async function doSubmitNote(input) {
  if (!input) return;
  const text = (input.value || '').trim();
  if (!text) return;

  P.noteInputs.push(text);
  P.notesSubmitted++;

  const total = P.room?.settings?.notesPerPlayer || P.settings.notesPerPlayer;
  const isLast = P.notesSubmitted >= total;

  // If this was the last note, submit to server and advance to the waiting room.
  if (isLast && !P._pendingSubmit) {
    P._pendingSubmit = true;
    if (api.isOnline()) {
      await api.submitNotes(P.roomCode, P.deviceId, P.noteInputs);
    } else if (P.room) {
      P.noteInputs.forEach(txt => {
        P.room.notes.push({ id: P.room.notes.length, text: txt, authorDeviceId: P.deviceId });
      });
      P.room.noteCount = P.room.notes.length;
      const me = P.room.players.find(p => p.deviceId === P.deviceId);
      if (me) me.notesSubmitted = true;
    }
    P._pendingSubmit = false;
    ptkGoto('ptakimWait');
    return;
  }

  // Patch DOM in place — do NOT re-render, so the mobile keyboard stays up
  // and focus stays in the input.
  const counter = document.querySelector('.ptk-note-counter');
  if (counter) counter.textContent = `${t('noteOf')} ${P.notesSubmitted + 1} ${t('of')} ${total}`;

  const progress = document.querySelector('.ptk-note-progress-fill');
  if (progress) progress.style.width = `${(P.notesSubmitted / total) * 100}%`;

  // Append the new submitted note chip
  let chipsWrap = document.querySelector('.ptk-submitted-notes');
  if (!chipsWrap) {
    const writeSection = document.querySelector('.ptk-write-section');
    if (writeSection) {
      chipsWrap = document.createElement('div');
      chipsWrap.className = 'ptk-submitted-notes';
      writeSection.appendChild(chipsWrap);
    }
  }
  if (chipsWrap) {
    const chip = document.createElement('div');
    chip.className = 'ptk-mini-note';
    chip.textContent = text;
    chipsWrap.appendChild(chip);
    // Hide the text after 2 seconds so shoulder-surfers can't read it.
    setTimeout(() => {
      if (chip.isConnected) {
        chip.classList.add('ptk-mini-note-hidden');
        chip.textContent = '✓';
      }
    }, 2000);
  }

  // Update submit-button label when the next tap will be the last
  const submitBtn = document.getElementById('ptk-submit-note');
  if (submitBtn) {
    submitBtn.textContent = (P.notesSubmitted + 1 >= total) ? t('submitNoteDone') : t('submitNote');
  }

  // Clear the input and keep focus (keyboard stays visible on mobile)
  input.value = '';
  input.focus();
}

/* =====================================================
   SCREEN: WAIT (waiting room — done with notes, waiting for host)
   ===================================================== */
function renderPtakimWait(app) {
  if (!P.roomCode || !P.room) { ptkGoto('ptakimHome'); return; }
  const room = P.room;
  const players = room.players || [];
  const readyCount = players.filter(p => p.notesSubmitted).length;
  const allDone = players.length >= 2 && players.every(p => p.notesSubmitted);

  if (api.isOnline() && !_unsubscribe) subscribeToRoom();

  // Footer: host can start when all players are ready; otherwise show waiting status
  let footerHtml = '';
  if (P.isHost) {
    if (allDone) {
      footerHtml = `
        <button class="btn btn-primary ptk-sticky-bottom-btn" id="ptk-start-game-btn" type="button">
          ${t('selectTeams')} →
        </button>
      `;
    } else {
      const missingNotes = players.length - readyCount;
      footerHtml = `
        <div class="ptk-waiting-note">
          ⏳ ${t('waitingForOthers', { n: missingNotes })}
        </div>
      `;
    }
  } else {
    footerHtml = `
      <div class="ptk-waiting-note">
        ⏳ ${t('waitingForHost')}
      </div>
    `;
  }

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner ptk-room-inner">
        <div class="ptk-room-header">
          <button class="btn-ghost" id="ptk-room-leave">${t('leave')}</button>
          <div class="ptk-room-header-title">${t('waitingRoom')}</div>
        </div>

        ${renderRoomCodeHero(room)}

        <div class="ptk-section-label">${t('players')} · ${readyCount}/${players.length}</div>
        ${renderPlayerChips(room)}

        <div class="ptk-done-banner">
          <div class="ptk-done-banner-icon">✅</div>
          <div class="ptk-done-banner-text">${t('notesDoneTitle')}</div>
          <div class="ptk-done-banner-sub">${t('notesDoneSub')}</div>
          ${P.noteInputs.length > 0 ? `
            <div class="ptk-submitted-notes" style="margin-top:12px;">
              ${P.noteInputs.map(n => `<div class="ptk-mini-note">${escHtml(n)}</div>`).join('')}
            </div>
          ` : ''}
        </div>

        ${P.isHost && api.isOnline() && import.meta.env.VITE_ENABLE_DEBUG === '1' ? `
          <div class="ptk-debug-section" style="margin-top:12px;">
            <div class="ptk-debug-label">🔧 DEBUG</div>
            <div class="ptk-debug-row">
              <select id="ptk-mock-count" class="ptk-debug-select">
                <option value="1">1 player</option>
                <option value="3" selected>3 players</option>
                <option value="5">5 players</option>
              </select>
              <button class="btn btn-secondary" id="ptk-add-mock-btn" type="button" style="padding:10px 16px;font-size:0.85rem;">+ Add mock</button>
            </div>
          </div>
        ` : ''}

        <div style="flex:1;"></div>

        <div class="ptk-room-footer">
          ${footerHtml}
        </div>
      </div>
    </div>
  `;

  wireLeaveButton();
  wireCodeShareHandlers(room);

  // Mock players (host only, online)
  const mockBtn = document.getElementById('ptk-add-mock-btn');
  if (mockBtn) {
    mockBtn.onclick = async () => {
      const count = parseInt(document.getElementById('ptk-mock-count').value) || 3;
      mockBtn.disabled = true; mockBtn.style.opacity = '0.6';
      const result = await api.addMockPlayers(P.roomCode, count);
      mockBtn.disabled = false; mockBtn.style.opacity = '1';
      if (result?.success) applyRoomUpdate(result.room);
    };
  }

  // Proceed → Team Setup (host only)
  const startBtn = document.getElementById('ptk-start-game-btn');
  if (startBtn) {
    startBtn.onclick = async () => {
      startBtn.disabled = true; startBtn.style.opacity = '0.6';
      // Seed empty teams (no auto-assignment). Host will drag players in.
      const initialTeams = [
        { name: t('team') + ' A', color: TEAM_COLORS[0], emoji: TEAM_EMOJIS[0], players: [], playerDeviceIds: [], explainerIdx: 0, scores: [0,0,0] },
        { name: t('team') + ' B', color: TEAM_COLORS[1], emoji: TEAM_EMOJIS[1], players: [], playerDeviceIds: [], explainerIdx: 0, scores: [0,0,0] },
      ];
      room.teams = initialTeams;

      if (api.isOnline()) {
        await doAction('update_teams', { teams: initialTeams });
        await doAction('set_phase', { phase: 'team_setup' });
      } else {
        room.phase = 'team_setup';
      }
      ptkGoto('ptakimTeamSetup');
    };
  }
}

/* =====================================================
   SCREEN: TEAM SETUP (full-screen, host-editable)
   ===================================================== */
// HTML helpers reused by both the initial render and in-place patches.
// Kept at module scope so patchTeamSetup() can call them without re-running
// renderPtakimTeamSetup (which would rebuild the whole screen).
function renderUnassignedHtml(unassigned, players) {
  return `
    <div class="ptk-label">${t('players')} (${unassigned.length})</div>
    <div class="ptk-unassigned-players">
      ${unassigned.length > 0 ? unassigned.map((p) => `
        <div class="ptk-draggable-player" data-device-id="${p.deviceId}">
          <span class="ptk-drag-avatar">${p.emoji || PLAYER_EMOJIS[players.indexOf(p) % PLAYER_EMOJIS.length]}</span>
          <span class="ptk-drag-name">${escHtml(p.name)}</span>
        </div>
      `).join('') : `
        <div class="ptk-drop-placeholder" style="grid-column:1/-1;">${t('unassignedEmpty')}</div>
      `}
    </div>
  `;
}

function renderTeamsHtml(teams, players, editable) {
  return teams.map((team, teamIdx) => `
    <div class="ptk-team-setup-col">
      <div class="ptk-team-setup-header" style="background:${team.color}20;border-color:${team.color};">
        <span class="ptk-team-emoji">${team.emoji}</span>
        <span class="ptk-team-name">${escHtml(team.name)}</span>
        <span class="ptk-team-count">(${team.playerDeviceIds?.length || 0})</span>
        ${editable && teams.length > 1 ? `
          <button class="ptk-remove-team-btn" data-team-idx="${teamIdx}" type="button" title="${t('removeTeam')}">🗑</button>
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
              ${editable ? `<button class="ptk-remove-from-team" data-device-id="${did}" type="button" title="${t('removeTeam')}">✕</button>` : ''}
            </div>
          `;
        }).join('')}
        ${(team.playerDeviceIds?.length || 0) === 0 ? `
          <div class="ptk-drop-placeholder">
            ${editable ? t('dragToMove') : '—'}
          </div>
        ` : ''}
        ${editable && (team.playerDeviceIds?.length || 0) > 0 && (team.playerDeviceIds?.length || 0) < 2 ? `
          <div class="ptk-team-warning">⚠️ ${t('minTwoPerTeam')}</div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * In-place DOM patch for the Team Setup screen. Rewrites ONLY the unassigned
 * pool + teams grid, not the whole screen. Also updates the Start Game button
 * state. Avoids the full-screen rebuild flicker that ptkGoto('ptakimTeamSetup')
 * would cause on every edit.
 */
function patchTeamSetup() {
  if (!P.room || P.screen !== 'ptakimTeamSetup') return;
  const room = P.room;
  const players = room.players || [];
  const editable = P.isHost;

  const assignedIds = new Set(room.teams.flatMap(team => team.playerDeviceIds || []));
  const unassigned = players.filter(p => !assignedIds.has(p.deviceId));

  const unassignedEl = document.getElementById('ptk-ts-unassigned-container');
  if (unassignedEl) unassignedEl.innerHTML = renderUnassignedHtml(unassigned, players);

  const teamsEl = document.getElementById('ptk-ts-teams-container');
  if (teamsEl) teamsEl.innerHTML = renderTeamsHtml(room.teams, players, editable);

  // Update start button enabled state
  const teamsWithPlayers = room.teams.filter(team => (team.playerDeviceIds?.length || 0) > 0);
  const teamsValid = teamsWithPlayers.length >= 2 &&
    teamsWithPlayers.every(team => (team.playerDeviceIds?.length || 0) >= 2);
  const startBtn = document.getElementById('ptk-ts-start');
  if (startBtn) {
    startBtn.disabled = !teamsValid;
    startBtn.style.opacity = teamsValid ? '1' : '0.5';
    startBtn.style.pointerEvents = teamsValid ? '' : 'none';
  }
}

function renderPtakimTeamSetup(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const room = P.room;
  const players = room.players || [];
  const editable = P.isHost;

  if (api.isOnline() && !_unsubscribe) subscribeToRoom();

  // Ensure team structure exists
  if (!room.teams || room.teams.length === 0) {
    room.teams = [
      { name: t('team') + ' A', color: TEAM_COLORS[0], emoji: TEAM_EMOJIS[0], players: [], playerDeviceIds: [], explainerIdx: 0, scores: [0, 0, 0] },
      { name: t('team') + ' B', color: TEAM_COLORS[1], emoji: TEAM_EMOJIS[1], players: [], playerDeviceIds: [], explainerIdx: 0, scores: [0, 0, 0] },
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
        <div class="ptk-room-header">
          ${editable ? `<button class="btn-ghost" id="ptk-ts-back">${t('back')}</button>` : '<div style="width:60px;"></div>'}
          <div class="ptk-room-header-title">${t('teamSetup')}</div>
        </div>

        <div class="ptk-room-code-bar" style="margin-bottom:12px;">
          <span class="ptk-room-code-label">${t('roomCodeLabel')}:</span>
          <span class="ptk-room-code-value">${P.roomCode}</span>
        </div>

        ${!editable ? `
          <div style="text-align:center;font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;">
            ${t('viewOnlyTeamSetup')}
          </div>
        ` : `
          <div style="text-align:center;font-size:0.82rem;color:var(--text-dim);margin-bottom:10px;">
            ${t('dragToMove')}
          </div>
        `}

        ${editable ? `
          <div class="ptk-team-actions">
            <button class="btn btn-secondary btn-sm" id="ptk-ts-random" type="button">🎲 ${t('randomAssign')}</button>
            <button class="btn btn-secondary btn-sm" id="ptk-ts-add-team" type="button">${t('addTeam')}</button>
          </div>
        ` : ''}

        ${editable ? `
          <div class="ptk-unassigned-section" id="ptk-ts-unassigned-container">
            ${renderUnassignedHtml(unassigned, players)}
          </div>
        ` : ''}

        <div class="ptk-teams-setup" id="ptk-ts-teams-container">
          ${renderTeamsHtml(room.teams, players, editable)}
        </div>

        <div style="flex:1;"></div>

        ${editable ? `
          <button class="btn btn-primary ptk-sticky-bottom-btn" id="ptk-ts-start" type="button" ${!teamsValid ? 'disabled style="opacity:0.5;pointer-events:none;"' : ''}>
            ${t('startGame')}
          </button>
        ` : ''}
      </div>
    </div>
  `;

  if (!editable) return;

  // Back → waiting room
  document.getElementById('ptk-ts-back').onclick = async () => {
    if (api.isOnline()) {
      await doAction('set_phase', { phase: 'lobby' });
    } else {
      P.room.phase = 'lobby';
    }
    ptkGoto('ptakimWait');
  };

  // Add team
  document.getElementById('ptk-ts-add-team').onclick = () => {
    const newIdx = room.teams.length;
    const letter = String.fromCharCode(65 + newIdx);
    room.teams.push({
      name: t('team') + ' ' + letter,
      color: TEAM_COLORS[newIdx % TEAM_COLORS.length],
      emoji: TEAM_EMOJIS[newIdx % TEAM_EMOJIS.length],
      players: [],
      playerDeviceIds: [],
      explainerIdx: 0,
      scores: [0, 0, 0],
    });
    syncTeamsToServer();
    patchTeamSetup();
  };

  // Helpers — rebuild derived fields and write to server
  function rebuildTeamPlayers() {
    room.teams.forEach(team => {
      team.players = (team.playerDeviceIds || []).map(id => {
        const p = players.find(pl => pl.deviceId === id);
        return p ? { deviceId: id, name: p.name, emoji: p.emoji } : { deviceId: id, name: id };
      });
    });
  }

  function applyAndPersist() {
    rebuildTeamPlayers();
    syncTeamsToServer();
    patchTeamSetup();
  }

  // Remove a player from every team (optionally reinsert into target at idx)
  function placePlayer(deviceId, targetTeamIdx, insertAt) {
    room.teams.forEach(team => {
      team.playerDeviceIds = (team.playerDeviceIds || []).filter(id => id !== deviceId);
    });
    if (targetTeamIdx >= 0 && targetTeamIdx < room.teams.length) {
      const tgt = room.teams[targetTeamIdx];
      tgt.playerDeviceIds = tgt.playerDeviceIds || [];
      if (typeof insertAt === 'number' && insertAt >= 0 && insertAt <= tgt.playerDeviceIds.length) {
        tgt.playerDeviceIds.splice(insertAt, 0, deviceId);
      } else {
        tgt.playerDeviceIds.push(deviceId);
      }
    }
    applyAndPersist();
  }

  // Random assign — distribute every player across existing teams, shuffled
  const randomBtn = document.getElementById('ptk-ts-random');
  if (randomBtn) {
    randomBtn.onclick = () => {
      if (!room.teams.length) return;
      const shuffled = shuffleArray(players.map(p => p.deviceId));
      room.teams.forEach(team => { team.playerDeviceIds = []; });
      shuffled.forEach((did, i) => {
        const teamIdx = i % room.teams.length;
        room.teams[teamIdx].playerDeviceIds.push(did);
      });
      applyAndPersist();
    };
  }

  // Event delegation on the screen root — one click listener survives in-place
  // patches. Each handler scoped to its target class.
  const screenRoot = app.querySelector('.ptk-screen');
  if (screenRoot) {
    screenRoot.addEventListener('click', (e) => {
      // Delete team
      const delTeamBtn = e.target.closest('.ptk-remove-team-btn');
      if (delTeamBtn) {
        e.stopPropagation();
        const teamIdx = parseInt(delTeamBtn.dataset.teamIdx);
        if (room.teams.length <= 1) return;
        room.teams.splice(teamIdx, 1);
        applyAndPersist();
        return;
      }
      // Remove player from team
      const removePlayerBtn = e.target.closest('.ptk-remove-from-team');
      if (removePlayerBtn) {
        e.stopPropagation();
        placePlayer(removePlayerBtn.dataset.deviceId, -1);
        return;
      }
    });
  }

  // ====================================================================
  // DRAG AND DROP — delegated pointer events on the screen root
  // ====================================================================
  // Using delegation lets us skip rebinding handlers after in-place patches:
  // newly rendered tiles automatically participate because the listener is on
  // the root. Each tile still gets its own touchAction=none via CSS.
  initTeamSetupDnd();

  function initTeamSetupDnd() {
    if (!screenRoot) return;
    const DRAG_THRESHOLD = 5;
    let state = null; // { tile, did, startX, startY, ghost, started, pointerId, hover }

    // `hover` tracks the currently-highlighted element so we don't touch the
    // DOM on every pointermove — only when the target actually changes. This
    // is what kills per-move flicker.
    function setHover(newEl, position) {
      const prevEl = state?.hover?.el;
      const prevPos = state?.hover?.position;
      if (prevEl === newEl && prevPos === position) return;
      if (prevEl) {
        prevEl.classList.remove('ptk-dnd-target', 'ptk-dnd-insert-before', 'ptk-dnd-insert-after');
      }
      if (newEl) {
        if (position === 'before') newEl.classList.add('ptk-dnd-insert-before');
        else if (position === 'after') newEl.classList.add('ptk-dnd-insert-after');
        else newEl.classList.add('ptk-dnd-target');
      }
      if (state) state.hover = newEl ? { el: newEl, position } : null;
    }

    // Compute what's under the pointer. Ghost has pointer-events:none so
    // elementFromPoint naturally ignores it.
    function findTargetAt(x, y) {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;

      // Over another player tile → before/after based on which half we're in
      const overPlayer = el.closest('.ptk-team-player[data-device-id]');
      if (overPlayer && overPlayer !== state.tile) {
        const r = overPlayer.getBoundingClientRect();
        const half = r.top + r.height / 2;
        const position = y < half ? 'before' : 'after';
        return {
          kind: 'player', el: overPlayer,
          teamIdx: parseInt(overPlayer.dataset.fromTeam),
          deviceId: overPlayer.dataset.deviceId,
          position,
        };
      }
      // Over a team drop zone → append
      const overZone = el.closest('.ptk-team-drop-zone');
      if (overZone) {
        return { kind: 'team', el: overZone, teamIdx: parseInt(overZone.dataset.teamIdx) };
      }
      // Unassigned section → remove from teams
      const overUnassigned = el.closest('.ptk-unassigned-section');
      if (overUnassigned) {
        return { kind: 'unassigned', el: overUnassigned };
      }
      return null;
    }

    function applyHoverForTarget(target) {
      if (!target) { setHover(null, null); return; }
      if (target.kind === 'player') setHover(target.el, target.position);
      else setHover(target.el, null);
    }

    function buildGhost(tile, x, y) {
      const rect = tile.getBoundingClientRect();
      const g = tile.cloneNode(true);
      g.classList.add('ptk-dnd-ghost');
      g.style.position = 'fixed';
      g.style.left = '0';
      g.style.top = '0';
      g.style.width = rect.width + 'px';
      g.style.margin = '0';
      g.style.pointerEvents = 'none';
      g.style.zIndex = '9999';
      g.style.transform = `translate(${x - rect.width / 2}px, ${y - rect.height / 2}px) scale(1.06)`;
      document.body.appendChild(g);
      return g;
    }

    function endDrag(e, commit) {
      if (!state) return;
      const s = state; state = null;
      window._ptkDragging = false;
      // Remove ALL ghost elements, not just the tracked one — safety against
      // any orphan ghost that slipped through from a previous drag.
      document.querySelectorAll('.ptk-dnd-ghost').forEach(g => g.remove());
      if (s.tile) s.tile.classList.remove('ptk-dnd-source');
      document.querySelectorAll('.ptk-dnd-target, .ptk-dnd-insert-before, .ptk-dnd-insert-after').forEach(el => {
        el.classList.remove('ptk-dnd-target', 'ptk-dnd-insert-before', 'ptk-dnd-insert-after');
      });

      if (!commit || !s.started) return;
      const target = findTargetAt(e.clientX, e.clientY);
      if (!target) return;

      if (target.kind === 'team') {
        placePlayer(s.did, target.teamIdx);
      } else if (target.kind === 'unassigned') {
        placePlayer(s.did, -1);
      } else if (target.kind === 'player') {
        // Compute the insert index in the target team AFTER removing the dragged
        // player — critical for same-team reordering to actually move anything.
        const tgtTeam = room.teams[target.teamIdx];
        const ids = (tgtTeam?.playerDeviceIds || []).filter(id => id !== s.did);
        const anchorIdx = ids.indexOf(target.deviceId);
        if (anchorIdx < 0) {
          placePlayer(s.did, target.teamIdx);
          return;
        }
        const insertAt = target.position === 'before' ? anchorIdx : anchorIdx + 1;
        placePlayer(s.did, target.teamIdx, insertAt);
      }
    }

    // Window-level listeners for move/up/cancel — guarantees we get the end of
    // the gesture even if the pointer leaves the screen root, the source tile
    // gets re-rendered, or the touch goes outside the app viewport.
    // Named handlers stored on window so we can remove them when navigating away.
    const onMove = (e) => {
      if (!state || e.pointerId !== state.pointerId) return;
      if (!state.started) {
        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;
        if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        state.started = true;
        window._ptkDragging = true;
        state.tile.classList.add('ptk-dnd-source');
        state.ghost = buildGhost(state.tile, e.clientX, e.clientY);
      }
      // Prevent scroll on touch while dragging
      if (e.cancelable) e.preventDefault();
      const rect = state.ghost.getBoundingClientRect();
      state.ghost.style.transform = `translate(${e.clientX - rect.width / 2}px, ${e.clientY - rect.height / 2}px) scale(1.06)`;
      applyHoverForTarget(findTargetAt(e.clientX, e.clientY));
    };
    const onUp = (e) => {
      if (!state || e.pointerId !== state.pointerId) return;
      endDrag(e, true);
    };
    const onCancel = (e) => {
      if (!state || e.pointerId !== state.pointerId) return;
      endDrag(e, false);
    };
    // Safety: if the window loses focus or the tab is hidden during a drag,
    // clean up so the ghost can never get orphaned.
    const onBlur = () => { if (state) endDrag({ clientX: 0, clientY: 0, pointerId: state.pointerId }, false); };

    // Clean up any previous instance of these listeners (re-entry safety)
    if (window._ptkDndCleanup) window._ptkDndCleanup();
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('blur', onBlur);
    window.addEventListener('visibilitychange', onBlur);
    window._ptkDndCleanup = () => {
      window.removeEventListener('pointermove', onMove, { passive: false });
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('visibilitychange', onBlur);
    };

    // Source selection happens here. pointerdown stays on the screen root so
    // we only react to real player tiles.
    screenRoot.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.ptk-remove-from-team')) return;
      const tile = e.target.closest('.ptk-draggable-player, .ptk-team-player[data-device-id]');
      if (!tile) return;
      if (e.button !== undefined && e.button !== 0) return;
      if (state) endDrag(e, false);
      state = {
        tile, did: tile.dataset.deviceId,
        startX: e.clientX, startY: e.clientY,
        ghost: null, started: false, pointerId: e.pointerId,
        hover: null,
      };
    });
  }

  // Start game
  document.getElementById('ptk-ts-start').onclick = async () => {
    room.teams.forEach(team => {
      team.players = (team.playerDeviceIds || []).map(did => {
        const p = players.find(pl => pl.deviceId === did);
        return p ? { deviceId: did, name: p.name, emoji: p.emoji } : { deviceId: did, name: did };
      });
    });
    if (api.isOnline()) {
      await doAction('start_game', { teams: room.teams });
    } else {
      room.currentRound = 1;
      const noteIndices = room.notes.map((_, i) => i);
      room.deck = shuffleArray(noteIndices);
      room.deckIndex = 0;
      room.currentTurn = { teamIdx: 0, playerIdx: 0, startTime: null, endTime: null };
      room.phase = 'round_intro';
    }
    ptkGoto('ptakimRoundIntro');
  };
}

/* =====================================================
   SCREEN: ROUND INTRO (team preview only; no edit)
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
      <div class="ptk-inner" style="justify-content:center;text-align:center;padding-top:32px;">
        <div class="ptk-round-badge">${t('round')} ${round} / 3</div>
        <div class="ptk-round-number">${roundIcons[round] || round}</div>
        <div class="ptk-round-rule">${roundNames[round] || ''}</div>
        <div class="ptk-round-desc">${(roundDescs[round] || '').replace(/\n/g, '<br>')}</div>

        <div style="height:12px;"></div>
        <div style="font-size:0.85rem;color:var(--text-dim);">
          ${P.room.noteCount || P.room.notes.length} ${t('notes')}
        </div>

        <!-- Team preview -->
        <div class="ptk-teams-preview">
          ${P.room.teams.map(team => `
            <div class="ptk-team-preview-card" style="border-color:${team.color};background:${team.color}15;">
              <div class="ptk-team-preview-header" style="color:${team.color};">
                ${team.emoji} ${escHtml(team.name)}
              </div>
              <div class="ptk-team-preview-players">
                ${(team.players || []).map(p => `
                  <div class="ptk-team-preview-player">
                    <span>${p.emoji || '👤'}</span>
                    <span>${escHtml(p.name)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        ${firstTeam && firstPlayer ? `
          <div class="ptk-next-up-card" style="border-color:${firstTeam.color};background:${firstTeam.color}15;">
            <div class="ptk-next-up-line">
              <span class="ptk-next-up-key">${t('nextTeam')}:</span>
              <span class="ptk-next-up-val" style="color:${firstTeam.color};">${firstTeam.emoji} ${escHtml(firstTeam.name)}</span>
            </div>
            <div class="ptk-next-up-line">
              <span class="ptk-next-up-key">${t('nextPlayerLabel')}:</span>
              <span class="ptk-next-up-val">${escHtml(firstPlayer.name)}</span>
            </div>
          </div>
        ` : ''}

        <div style="height:24px;"></div>
        ${P.isHost ? `
          <button class="btn btn-primary" id="ptk-start-round-btn" type="button">
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
      startRoundBtn.disabled = true;
      startRoundBtn.style.opacity = '0.6';
      if (api.isOnline()) {
        // Transition everyone to turn_active (without starting timer)
        // so all clients navigate into the Playing screen together.
        // Active player will tap "Start Turn" to begin the timer.
        await doAction('set_phase', { phase: 'turn_active' });
      } else {
        if (!P.room.currentTurn) {
          P.room.currentTurn = {
            teamIdx: 0,
            playerIdx: P.room.teams[0].explainerIdx,
            startTime: null,
            endTime: null,
          };
        }
        P.room.phase = 'turn_active';
      }
      ptkGoto('ptakimPlaying');
    };
  }
}

/* =====================================================
   TEAM EDIT MODAL
   ===================================================== */
function showTeamEditModal() {
  if (!P.room) return;

  const modal = document.createElement('div');
  modal.className = 'ptk-modal-overlay';
  modal.id = 'ptk-teams-modal';
  document.body.appendChild(modal);

  const render = () => {
    const room = P.room;
    const players = room.players || [];

    const canRemove = room.teams.length > 2;

    modal.innerHTML = `
      <div class="ptk-modal ptk-modal-large">
        <div class="ptk-modal-header">
          <div class="ptk-modal-title">${t('editTeams')}</div>
          <button class="ptk-modal-close" id="ptk-teams-close" type="button">✕</button>
        </div>
        <div class="ptk-modal-sub">${t('tapToMove')}</div>

        <div class="ptk-team-edit-actions">
          <button class="btn btn-secondary btn-sm" id="ptk-modal-shuffle" type="button">${t('shuffleTeams')}</button>
          <button class="btn btn-secondary btn-sm" id="ptk-modal-add-team" type="button">${t('addTeam')}</button>
        </div>

        <div class="ptk-team-edit-list">
          ${room.teams.map((team, tIdx) => `
            <div class="ptk-team-edit-row" style="border-color:${team.color};background:${team.color}10;">
              <div class="ptk-team-edit-header" style="color:${team.color};">
                <span>${team.emoji} ${escHtml(team.name)} <small>(${team.playerDeviceIds?.length || 0})</small></span>
                ${canRemove ? `<button class="ptk-remove-team-btn" data-tidx="${tIdx}" type="button">✕</button>` : ''}
              </div>
              <div class="ptk-team-edit-players">
                ${(team.playerDeviceIds || []).map(did => {
                  const player = players.find(p => p.deviceId === did);
                  if (!player) return '';
                  return `
                    <button class="ptk-team-edit-player" data-did="${did}" type="button">
                      <span>${player.emoji || '👤'}</span>
                      <span>${escHtml(player.name)}</span>
                    </button>
                  `;
                }).join('')}
                ${(team.playerDeviceIds?.length || 0) === 0 ? `<div class="ptk-drop-placeholder">—</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <button class="btn btn-primary" id="ptk-teams-done" type="button" style="margin-top:16px;width:100%;">
          ${t('doneEditing')}
        </button>
      </div>
    `;

    document.getElementById('ptk-teams-close').onclick = () => modal.remove();
    document.getElementById('ptk-teams-done').onclick = () => modal.remove();

    document.getElementById('ptk-modal-shuffle').onclick = () => {
      const numTeams = P.room.teams.length;
      const shuffled = shuffleArray(P.room.players.map(p => p.deviceId));
      P.room.teams.forEach(team => { team.playerDeviceIds = []; team.players = []; });
      shuffled.forEach((did, i) => {
        const teamIdx = i % numTeams;
        P.room.teams[teamIdx].playerDeviceIds.push(did);
      });
      P.room.teams.forEach(team => {
        team.players = team.playerDeviceIds.map(did => {
          const p = P.room.players.find(pl => pl.deviceId === did);
          return p ? { deviceId: did, name: p.name, emoji: p.emoji } : { deviceId: did, name: did };
        });
      });
      syncTeamsToServer();
      render();
    };

    document.getElementById('ptk-modal-add-team').onclick = () => {
      const newIdx = P.room.teams.length;
      const letter = String.fromCharCode(65 + newIdx);
      P.room.teams.push({
        name: t('team') + ' ' + letter,
        color: TEAM_COLORS[newIdx % TEAM_COLORS.length],
        emoji: TEAM_EMOJIS[newIdx % TEAM_EMOJIS.length],
        players: [],
        playerDeviceIds: [],
        explainerIdx: 0,
        scores: [0, 0, 0],
      });
      syncTeamsToServer();
      render();
    };

    document.querySelectorAll('.ptk-remove-team-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const tIdx = parseInt(btn.dataset.tidx);
        if (P.room.teams.length <= 2) return;
        // Re-distribute players to remaining teams
        const team = P.room.teams[tIdx];
        const orphans = team.playerDeviceIds || [];
        P.room.teams.splice(tIdx, 1);
        orphans.forEach((did, i) => {
          const targetIdx = i % P.room.teams.length;
          P.room.teams[targetIdx].playerDeviceIds.push(did);
        });
        P.room.teams.forEach(team => {
          team.players = team.playerDeviceIds.map(did => {
            const p = P.room.players.find(pl => pl.deviceId === did);
            return p ? { deviceId: did, name: p.name, emoji: p.emoji } : { deviceId: did, name: did };
          });
        });
        syncTeamsToServer();
        render();
      };
    });

    // Tap player to cycle to next team
    document.querySelectorAll('.ptk-team-edit-player').forEach(btn => {
      btn.onclick = () => {
        const did = btn.dataset.did;
        // Find current team and move to next
        const currentTeamIdx = P.room.teams.findIndex(team => (team.playerDeviceIds || []).includes(did));
        if (currentTeamIdx < 0) return;
        const nextTeamIdx = (currentTeamIdx + 1) % P.room.teams.length;
        P.room.teams.forEach(team => {
          team.playerDeviceIds = (team.playerDeviceIds || []).filter(id => id !== did);
        });
        P.room.teams[nextTeamIdx].playerDeviceIds.push(did);
        P.room.teams.forEach(team => {
          team.players = team.playerDeviceIds.map(did => {
            const p = P.room.players.find(pl => pl.deviceId === did);
            return p ? { deviceId: did, name: p.name, emoji: p.emoji } : { deviceId: did, name: did };
          });
        });
        syncTeamsToServer();
        render();
      };
    });
  };

  render();
}

function syncTeamsToServer() {
  if (api.isOnline() && P.room) {
    doAction('update_teams', { teams: P.room.teams });
  }
}

/* =====================================================
   SCREEN: PLAYING (active turn)
   ===================================================== */
function renderPtakimPlaying(app) {
  if (!P.room || !P.room.currentTurn) { ptkGoto('ptakimHome'); return; }

  // Kick off mock auto-drive (host-only): if the active player is a mock,
  // host starts, scores, and ends the turn automatically.
  if (isMockActivePlayer()) driveMockTurn();

  const turn = P.room.currentTurn;
  const team = P.room.teams[turn.teamIdx];
  const player = team.players[turn.playerIdx];
  const round = P.room.currentRound;
  const roundNames = [null, t('round1name'), t('round2name'), t('round3name')];
  const timerStarted = !!turn.startTime;
  const isPaused = !!turn.paused;
  const active = isActivePlayer();
  const note = active ? getCurrentNote() : null;
  const deckSize = P.room.deck?.length || P.room.noteCount || 0;
  const deckIdx = P.room.deckIndex || 0;
  const notesRemaining = Math.max(0, deckSize - deckIdx);
  const isLoading = note?.loading;

  let timerColor = '#16a34a';
  const pct = timerStarted ? P.timeLeft / TURN_SECONDS : 1;
  if (pct < 0.25) timerColor = '#dc2626';
  else if (pct < 0.5) timerColor = '#ca8a04';
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  const roomCodeBarHtml = `
    <div class="ptk-room-code-bar">
      <span class="ptk-room-code-label">${t('roomCodeLabel')}:</span>
      <span class="ptk-room-code-value">${P.roomCode}</span>
      ${P.isHost ? `<button class="ptk-end-game-btn" id="ptk-end-game" type="button">⏹ ${t('endGame')}</button>` : ''}
    </div>
  `;

  const headerHtml = `
    ${roomCodeBarHtml}
    <div style="width:100%;text-align:center;">
      <div class="ptk-round-indicator">${t('roundN')} ${round} — ${roundNames[round] || ''}</div>
      <div style="font-size:0.85rem;margin-bottom:4px;">
        <span style="color:${team.color};font-weight:700;">${team.emoji} ${escHtml(team.name)}</span>
      </div>
      <div style="font-size:1rem;font-weight:700;margin-bottom:4px;">
        ${active ? t('yourTurn') : `${escHtml(player.name)} — ${t('isPlaying')}`}
      </div>
    </div>
  `;

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
    // Spectator
    const waitingContextHtml = !timerStarted ? `
      <div class="ptk-spectator-card" style="padding:28px 24px;">
        <div class="ptk-spectator-icon" style="background:${team.color}22;border:2px solid ${team.color};">
          ${player.emoji || '👤'}
        </div>
        <div class="ptk-spectator-text">${t('waitingToStart')}</div>
        <div style="font-size:0.9rem;color:var(--text-dim);margin-top:6px;">
          <span style="color:${team.color};">${team.emoji} ${escHtml(team.name)}</span> · ${escHtml(player.name)}
        </div>
      </div>
    ` : `
      <div class="ptk-spectator-card">
        <div class="ptk-spectator-icon" style="background:${team.color}22;border:2px solid ${team.color};">
          ${player.emoji || '👤'}
        </div>
        <div class="ptk-spectator-text">${escHtml(player.name)} ${t('turnInProgress')}</div>
      </div>
      <div class="ptk-deck-count">${notesRemaining} ${t('notes')}</div>
      ${isPaused ? `<div class="ptk-paused-label">⏸ ${t('paused')}</div>` : ''}
    `;

    app.innerHTML = `
      <div class="ptk-screen">
        <div class="ptk-inner" style="justify-content:space-between;">
          ${headerHtml}
          <div style="display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;gap:16px;">
            ${timerHtml}
            ${waitingContextHtml}
          </div>
          <div style="text-align:center;padding-bottom:8px;">
            <div class="ptk-turn-status" style="font-size:0.78rem;color:var(--text-muted);">
              ${t('guessed')}: ${P.turnCorrect} · ${t('skipped')}: ${P.turnSkipped}
            </div>
          </div>
        </div>
      </div>
    `;
    attachEndGameHandler();
    return;
  }

  // Active player
  const overlayVisible = P.noteVisibility !== 'hidden';
  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:space-between;">
        ${headerHtml}
        <div style="display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center;gap:12px;">
          ${timerHtml}
          ${!timerStarted ? `
            <div class="ptk-your-turn-banner">
              <div class="ptk-your-turn-icon">🎯</div>
              <div class="ptk-your-turn-title">${t('yourTurnBig')}</div>
              <div class="ptk-your-turn-sub">${t('yourTurnSub')}</div>
            </div>
            <button class="btn btn-primary" id="ptk-play-btn" type="button" style="max-width:280px;font-size:1.2rem;padding:16px;">
              ${t('startTurn')}
            </button>
          ` : `
            <div class="ptk-note-card" id="ptk-note-card">
              ${note && note.text && !isLoading ? `<div class="ptk-note-text">${escHtml(note.text)}</div>` :
                notesRemaining <= 0 ? `<div class="ptk-note-text">${t('deckEmpty')}</div>` :
                `<div class="ptk-note-text ptk-loading">⏳</div>`}
              ${note && note.text && !isLoading ? `
                <div class="ptk-note-hidden-overlay" id="ptk-note-overlay"
                  style="opacity:${overlayVisible ? '0' : '1'};pointer-events:${overlayVisible ? 'none' : 'auto'};">
                  <div class="ptk-note-hidden-icon">👁️</div>
                  <div class="ptk-note-hidden-text">${t('holdToReveal')}</div>
                </div>
              ` : ''}
            </div>
            <div class="ptk-deck-count">${notesRemaining} ${t('notes')}</div>
            ${isPaused ? `<div class="ptk-paused-label">⏸ ${t('paused')}</div>` : ''}
            ${notesRemaining > 0 ? `
              <div class="ptk-play-buttons">
                ${P.room.settings.skipAllowed ? `
                  <button class="btn btn-skip" id="ptk-skip-btn" type="button" style="flex:1;" ${!note || isLoading || isPaused ? 'disabled' : ''}>
                    ${t('skip')}
                  </button>
                ` : ''}
                <button class="btn btn-correct" id="ptk-correct-btn" type="button" style="flex:${P.room.settings.skipAllowed ? '2' : '1'};" ${!note || isLoading || isPaused ? 'disabled' : ''}>
                  ${t('correct')}
                </button>
              </div>
              <button class="btn btn-secondary" id="ptk-pause-btn" type="button" style="max-width:280px;margin-top:10px;">
                ${isPaused ? t('resumeTurn') : t('pauseTurn')}
              </button>
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

  const playBtn = document.getElementById('ptk-play-btn');
  if (playBtn) {
    playBtn.onclick = async () => {
      playBtn.disabled = true;
      playBtn.textContent = '⏳';
      if (api.isOnline()) {
        await doAction('start_turn');
        const noteResult = await api.getNote(P.roomCode, P.deviceId);
        if (noteResult && noteResult.text) P._currentNoteText = noteResult.text;
      }
      startTurn();
    };
  }

  const correctBtn = document.getElementById('ptk-correct-btn');
  if (correctBtn) correctBtn.onclick = () => handleTurnAction('correct');
  const skipBtn = document.getElementById('ptk-skip-btn');
  if (skipBtn) skipBtn.onclick = () => handleTurnAction('skip');

  const pauseBtn = document.getElementById('ptk-pause-btn');
  if (pauseBtn) {
    pauseBtn.onclick = async () => {
      pauseBtn.disabled = true;
      pauseBtn.style.opacity = '0.6';
      const action = P.room?.currentTurn?.paused ? 'resume_turn' : 'pause_turn';
      // Apply optimistic local update so spectators + active player see the
      // state flip immediately; server broadcast will reconcile.
      if (P.room?.currentTurn) {
        if (action === 'pause_turn') {
          const remaining = Math.max(0, (P.room.currentTurn.endTime || 0) - Date.now());
          P.room.currentTurn = { ...P.room.currentTurn, paused: true, pausedRemainingMs: remaining };
        } else {
          const remaining = P.room.currentTurn.pausedRemainingMs || 0;
          P.room.currentTurn = {
            ...P.room.currentTurn,
            paused: false,
            pausedRemainingMs: 0,
            endTime: Date.now() + remaining,
          };
        }
      }
      if (api.isOnline()) await doAction(action);
      if (P.room?.currentTurn?.paused === false) startLocalTimer(isActivePlayer());
      ptkRender();
    };
  }

  // Press-and-hold reveal
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
    noteCard.onpointerdown = reveal;
    noteCard.onpointerup = hide;
    noteCard.onpointerleave = hide;
    noteCard.onpointercancel = hide;
    noteCard.ontouchstart = (e) => { e.preventDefault(); reveal(); };
    noteCard.ontouchend = hide;
    noteCard.ontouchcancel = hide;
  }

  attachEndGameHandler();
}

/* =====================================================
   In-place note swap: no full re-render, no flicker.
   Updates the note card, counters, and deck-count in place.
   Fires the server action in parallel.
   ===================================================== */
let _turnActionInFlight = false;
async function handleTurnAction(kind) {
  if (!P.room || !P.room.currentTurn) return;
  if (_turnActionInFlight) return;
  _turnActionInFlight = true;

  // Optimistic local updates
  if (kind === 'correct') P.turnCorrect++;
  else P.turnSkipped++;

  // Flash & hide the current note before we know the next one
  flashCard(kind);
  P.noteVisibility = 'hidden';
  P._currentNoteText = null;
  updateNoteOverlay();
  updatePlayingCounters();
  // Show ⏳ while we fetch the next note
  setNoteCardLoading();

  try {
    if (api.isOnline()) {
      const action = kind === 'correct' ? 'correct' : 'skip';
      // Sequential: the 'correct'/'skip' action advances deck_index on the
      // server. Fetching the next note must happen AFTER that write commits,
      // otherwise the filter query reads the old deck_index and returns the
      // note we just guessed (duplicate-note bug).
      await doAction(action, { turnCorrect: P.turnCorrect, turnSkipped: P.turnSkipped });
      const noteResult = await api.getNote(P.roomCode, P.deviceId);
      if (noteResult && noteResult.text) {
        P._currentNoteText = noteResult.text;
        swapNoteText(noteResult.text);
        showAutoReveal();
      } else {
        P._currentNoteText = null;
        // Deck empty — end turn (server will transition phase)
        endTurn(true);
      }
    } else {
      if (kind === 'correct') {
        P.room.deckIndex++;
        if (P.room.deckIndex >= P.room.deck.length) { endTurn(true); return; }
      } else {
        const curIdx = P.room.deck[P.room.deckIndex];
        P.room.deck.push(curIdx);
        P.room.deckIndex++;
        if (P.room.deckIndex >= P.room.deck.length) { endTurn(true); return; }
      }
      const next = getCurrentNote();
      if (next?.text) {
        swapNoteText(next.text);
        showAutoReveal();
      }
    }
  } finally {
    _turnActionInFlight = false;
  }
}

function setNoteCardLoading() {
  const text = document.querySelector('#ptk-note-card .ptk-note-text');
  if (text) { text.textContent = '⏳'; text.classList.add('ptk-loading'); }
  const overlay = document.getElementById('ptk-note-overlay');
  if (overlay) overlay.style.display = 'none';
}

function swapNoteText(newText) {
  const text = document.querySelector('#ptk-note-card .ptk-note-text');
  if (text) { text.classList.remove('ptk-loading'); text.textContent = newText; }
  const overlay = document.getElementById('ptk-note-overlay');
  if (overlay) overlay.style.display = '';
  updatePlayingCounters();
}

function updatePlayingCounters() {
  // Deck remaining count
  const deckSize = P.room?.deck?.length || P.room?.noteCount || 0;
  const deckIdx = P.room?.deckIndex || 0;
  const remaining = Math.max(0, deckSize - deckIdx);
  const deckEl = document.querySelector('.ptk-deck-count');
  if (deckEl) deckEl.textContent = `${remaining} ${t('notes')}`;
  // Guessed/skipped bottom line
  const statusEl = document.querySelector('.ptk-turn-status');
  if (statusEl) statusEl.textContent = `${t('guessed')}: ${P.turnCorrect} · ${t('skipped')}: ${P.turnSkipped}`;
}

function attachEndGameHandler() {
  const endGameBtn = document.getElementById('ptk-end-game');
  if (endGameBtn) {
    endGameBtn.onclick = () => showEndGameConfirm();
  }
}

function showEndGameConfirm() {
  showConfirmModal(t('endGameConfirm'), async () => {
    if (api.isOnline()) {
      try {
        await doAction('end_game');
        await new Promise(r => setTimeout(r, 300));
      } catch (_) {}
    }
    forceEndGame();
  });
}

function showTurnEndConfirm() {
  if (!isActivePlayer()) return;
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
        <button class="btn btn-secondary" id="ptk-turn-no" type="button" style="flex:1;">${t('didNotGuess')}</button>
        <button class="btn btn-correct" id="ptk-turn-yes" type="button" style="flex:1;">${t('guessedIt')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('ptk-turn-no').onclick = async () => {
    modal.remove();
    await endTurnWithResult(false);
  };
  document.getElementById('ptk-turn-yes').onclick = async () => {
    modal.remove();
    P.turnCorrect++;
    await endTurnWithResult(true);
  };
}

async function endTurnWithResult(lastWordGuessed) {
  if (api.isOnline()) {
    await doAction('end_turn', {
      turnCorrect: P.turnCorrect,
      turnSkipped: P.turnSkipped,
      lastWordGuessed: lastWordGuessed,
    });
  }
  endTurn(false, true);
}

function forceEndGame() {
  clearInterval(P.localTimer);
  clearTimeout(P.autoRevealTimeout);
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
  clearInterval(_pollInterval);
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
  clearGameState();
  P.screen = 'modeSelect';
  if (window.G) {
    window.G.screen = 'modeSelect';
    if (typeof window.render === 'function') {
      window.render();
      return;
    }
  }
  ptkRender();
}

/* =====================================================
   SCREEN: TURN RESULT
   ===================================================== */
function renderPtakimTurnResult(app) {
  if (!P.room || !P.room.turnResults) { ptkGoto('ptakimHome'); return; }

  // If the next player is a mock, auto-advance after a brief pause
  driveMockNextTurn();

  const res = P.room.turnResults;
  const team = P.room.teams[res.teamIdx];
  const player = team.players[res.playerIdx];

  // Compute who plays next (team + player) without mutating state.
  // Logic mirrors gameAction's 'next_turn' case.
  const teams = P.room.teams;
  const nextTeamIdx = (res.teamIdx + 1) % teams.length;
  const wrappedRound = nextTeamIdx <= res.teamIdx;
  // When we wrap past all teams, each team's explainerIdx would have been advanced
  // — but here we just need to preview the next turn's explainer on the next team.
  const nextTeam = teams[nextTeamIdx];
  const nextExplainerIdx = wrappedRound
    ? (nextTeam.explainerIdx + 1) % (nextTeam.players.length || 1)
    : nextTeam.explainerIdx;
  const nextPlayer = nextTeam.players?.[nextExplainerIdx];
  const nextDeviceId = nextTeam.playerDeviceIds?.[nextExplainerIdx];
  const imNext = nextDeviceId === P.deviceId;

  app.innerHTML = `
    <div class="ptk-screen">
      <div class="ptk-inner" style="justify-content:center;text-align:center;">
        <div style="font-size:1.3rem;font-weight:800;margin-bottom:16px;">${t('turnResults')}</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;">
          <span style="color:${team.color};font-size:1.2rem;">${team.emoji}</span>
          <span style="font-weight:700;">${escHtml(team.name)}</span>
          <span style="color:var(--text-dim);">— ${escHtml(player.name)}</span>
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

        ${nextTeam && nextPlayer ? `
          <div class="ptk-next-up-card" style="border-color:${nextTeam.color};background:${nextTeam.color}15;">
            <div class="ptk-next-up-line">
              <span class="ptk-next-up-key">${t('nextTeam')}:</span>
              <span class="ptk-next-up-val" style="color:${nextTeam.color};">${nextTeam.emoji} ${escHtml(nextTeam.name)}</span>
            </div>
            <div class="ptk-next-up-line">
              <span class="ptk-next-up-key">${t('nextPlayerLabel')}:</span>
              <span class="ptk-next-up-val">${escHtml(nextPlayer.name)}</span>
              ${imNext ? `<span class="ptk-next-up-you">${t('you')}</span>` : ''}
            </div>
          </div>
        ` : ''}

        <div style="height:20px;"></div>

        ${imNext ? `
          <button class="btn btn-primary" id="ptk-next-turn-btn" type="button">${t('startTurn')}</button>
        ` : `
          <div style="font-size:0.88rem;color:var(--text-dim);">
            ${nextPlayer ? t('waitingForPlayer', { name: escHtml(nextPlayer.name) }) : t('waitingToStart')}
          </div>
        `}
      </div>
    </div>
  `;

  const btn = document.getElementById('ptk-next-turn-btn');
  if (btn) {
    btn.onclick = async () => {
      btn.disabled = true; btn.style.opacity = '0.6';
      if (api.isOnline()) await doAction('next_turn');
      else advanceToNextTurn();
      ptkGoto('ptakimPlaying');
    };
  }
}

/* =====================================================
   SCREEN: ROUND RESULT
   ===================================================== */
function renderPtakimRoundResult(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const round = P.room.currentRound;
  const roundNames = [null, t('round1name'), t('round2name'), t('round3name')];

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
        ${P.isHost ? `
          <button class="btn btn-primary" id="ptk-next-round-btn" type="button">
            ${round >= 3 ? t('gameOver') : t('nextRound')}
          </button>
        ` : `
          <div style="font-size:0.88rem;color:var(--text-dim);text-align:center;">${t('waitingForHost')}</div>
        `}
      </div>
    </div>
  `;

  const btn = document.getElementById('ptk-next-round-btn');
  if (btn) {
    btn.onclick = async () => {
      if (api.isOnline()) await doAction('next_round');
      else advanceToNextRound();
      if (P.room.phase === 'game_finished') ptkGoto('ptakimFinal');
      else ptkGoto('ptakimRoundIntro');
    };
  }
}

/* =====================================================
   SCREEN: FINAL
   ===================================================== */
function renderPtakimFinal(app) {
  if (!P.room) { ptkGoto('ptakimHome'); return; }
  const winnerIdx = getWinnerTeamIdx();
  const winner = P.room.teams[winnerIdx];

  // Game is over — remove persisted state so a future reload doesn't
  // bring the user back to this Final screen.
  clearGameState();

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
        <div class="ptk-result-title" style="margin-top:8px;">${t('finalScores')}</div>
        <div class="ptk-final-teams">
          ${P.room.teams.map((team, i) => `
            <div class="ptk-final-team-card" style="border-color:${team.color};background:${team.color}10;">
              <div class="ptk-final-team-header">
                <span class="ptk-final-team-name" style="color:${team.color};">
                  ${team.emoji} ${escHtml(team.name)}
                  ${i === winnerIdx ? ' 🏆' : ''}
                </span>
                <span class="ptk-final-team-total" style="color:${team.color};">${getTeamTotalScore(i)}</span>
              </div>
              <div class="ptk-final-team-players">
                ${(team.players || []).map(p => `
                  <div class="ptk-final-team-player">
                    <span>${p.emoji || '👤'}</span>
                    <span>${escHtml(p.name)}</span>
                  </div>
                `).join('')}
              </div>
              <div class="ptk-final-team-rounds">
                <span class="ptk-final-round">${t('r1short')}: <b>${team.scores[0]}</b></span>
                <span class="ptk-final-round">${t('r2short')}: <b>${team.scores[1]}</b></span>
                <span class="ptk-final-round">${t('r3short')}: <b>${team.scores[2]}</b></span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="height:24px;"></div>
        <button class="btn btn-primary" id="ptk-play-again" type="button" style="margin-bottom:10px;">${t('playAgain')}</button>
        <button class="btn btn-secondary" id="ptk-back-menu" type="button">${t('backToMenu')}</button>
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

function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  } catch (_) { fallbackCopy(text); }
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch (_) {}
}

function buildJoinUrl(roomCode) {
  const origin = (window.location && window.location.origin) || '';
  const path = (window.location && window.location.pathname) || '/';
  return `${origin}${path}?ptk=${encodeURIComponent(roomCode)}`;
}

function shareOnWhatsapp(roomCode) {
  const url = buildJoinUrl(roomCode);
  const msg = t('shareMessage').replace('{code}', roomCode).replace('{url}', url);
  const waUrl = 'https://wa.me/?text=' + encodeURIComponent(msg);
  if (navigator.share) {
    navigator.share({ text: msg, url }).catch(() => { window.open(waUrl, '_blank'); });
  } else {
    window.open(waUrl, '_blank');
  }
}

function showConfirmModal(message, onYes) {
  const modal = document.createElement('div');
  modal.className = 'ptk-modal-overlay';
  modal.innerHTML = `
    <div class="ptk-modal">
      <div class="ptk-modal-icon">⚠️</div>
      <div class="ptk-modal-text">${escHtml(message)}</div>
      <div class="ptk-modal-buttons">
        <button class="btn btn-secondary" id="ptk-confirm-no" type="button">${t('no')}</button>
        <button class="btn btn-danger" id="ptk-confirm-yes" type="button">${t('yes')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('ptk-confirm-no').onclick = () => modal.remove();
  document.getElementById('ptk-confirm-yes').onclick = async () => {
    modal.remove();
    if (onYes) await onYes();
  };
}

function showEditNameModal() {
  const modal = document.createElement('div');
  modal.className = 'ptk-modal-overlay';
  modal.innerHTML = `
    <div class="ptk-modal">
      <div class="ptk-modal-icon">✏️</div>
      <div class="ptk-modal-text">${t('yourName')}</div>
      <input class="ptk-edit-name-input" id="ptk-edit-name-input" maxlength="20" value="${escHtml(P.playerName)}">
      <div class="ptk-edit-name-error" id="ptk-edit-name-error"></div>
      <div class="ptk-modal-buttons" style="margin-top:12px;">
        <button class="btn btn-secondary" id="ptk-edit-name-cancel" type="button">${t('cancelEdit')}</button>
        <button class="btn btn-primary" id="ptk-edit-name-save" type="button">${t('saveName')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const input = document.getElementById('ptk-edit-name-input');
  setTimeout(() => { input.focus(); input.select(); }, 50);

  document.getElementById('ptk-edit-name-cancel').onclick = () => modal.remove();
  document.getElementById('ptk-edit-name-save').onclick = async () => {
    const newName = (input.value || '').trim();
    const errorEl = document.getElementById('ptk-edit-name-error');
    if (!newName) { errorEl.textContent = t('enterName'); return; }
    if (newName === P.playerName) { modal.remove(); return; }

    const saveBtn = document.getElementById('ptk-edit-name-save');
    saveBtn.disabled = true; saveBtn.style.opacity = '0.6';

    if (api.isOnline() && P.roomCode) {
      const result = await api.updatePlayerName(P.roomCode, P.deviceId, newName);
      if (!result || result.error) {
        saveBtn.disabled = false; saveBtn.style.opacity = '1';
        errorEl.textContent = result?.error === 'Name already taken' ? t('nameTaken') : (result?.error || 'Failed');
        return;
      }
      applyRoomUpdate(result.room);
    } else if (P.room) {
      const me = P.room.players.find(p => p.deviceId === P.deviceId);
      if (me) me.name = newName;
    }
    P.playerName = newName;
    localStorage.setItem('ptakim_player_name', newName);
    modal.remove();
    ptkRender();
  };
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
  P.isHost = false;
  P.notesSubmitted = 0;
  P.noteInputs = [];
  P._currentNoteText = null;
  P.noteVisibility = 'hidden';
  clearGameState();
}

/* =====================================================
   REGISTER SCREENS GLOBALLY
   ===================================================== */
window.PTAKIM_SCREENS = {
  ptakimHome: renderPtakimHome,
  ptakimSetup: renderPtakimSetup,
  ptakimNotes: renderPtakimNotes,
  ptakimWait: renderPtakimWait,
  ptakimTeamSetup: renderPtakimTeamSetup,
  ptakimRoundIntro: renderPtakimRoundIntro,
  ptakimPlaying: renderPtakimPlaying,
  ptakimTurnResult: renderPtakimTurnResult,
  ptakimRoundResult: renderPtakimRoundResult,
  ptakimFinal: renderPtakimFinal,
};

window.ptkGoto = ptkGoto;
window.P = P;
window.forceEndGame = forceEndGame;

/* =====================================================
   INITIALIZATION — URL deeplink + state restore
   ===================================================== */
(function initPtakim() {
  const waitForShell = (cb) => {
    if (window.G && typeof window.render === 'function') cb();
    else setTimeout(() => waitForShell(cb), 80);
  };

  const goTo = (screen) => waitForShell(() => {
    P.screen = screen;
    window.G.screen = screen;
    window.render();
  });

  const goHome = (alertMsg) => {
    cleanupRoom();
    if (alertMsg) {
      waitForShell(() => {
        window.G.screen = 'modeSelect';
        window.render();
        setTimeout(() => { try { alert(alertMsg); } catch (_) {} }, 50);
      });
    } else {
      goTo('modeSelect');
    }
  };

  // 1) Deep-link: ?ptk=CODE — join immediately, no setup form.
  let linkCode = '';
  try {
    const params = new URLSearchParams(window.location.search);
    linkCode = (params.get('ptk') || '').toUpperCase().trim();
    if (linkCode) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  } catch (_) {}

  if (linkCode && /^[A-Z0-9]{4}$/.test(linkCode)) {
    cleanupRoom();
    if (!api.isOnline()) { goHome(); return; }

    const savedName = (P.playerName || '').trim();
    if (!savedName) {
      // First-time user with no saved name — send them through the setup form
      // with the code prefilled so they can pick a name.
      P.setupMode = 'join';
      waitForShell(() => {
        P.screen = 'ptakimSetup';
        window.G.screen = 'ptakimSetup';
        window.render();
        setTimeout(() => {
          const codeInput = document.getElementById('ptk-setup-code');
          if (codeInput) codeInput.value = linkCode;
        }, 50);
      });
      return;
    }

    api.joinRoom(linkCode, P.deviceId, savedName).then(result => {
      if (!result || !result.success) {
        goHome(t('roomNotFound'));
        return;
      }
      P.roomCode = linkCode;
      P.isHost = result.room.host_device_id === P.deviceId;
      P.joined = true;
      P.room = normalizeRoom(result.room);
      if (P.room) P.room.id = result.roomId;
      P.notesSubmitted = 0;
      P.noteInputs = [];
      subscribeToRoom();
      goTo('ptakimNotes');
    }).catch(() => goHome(t('roomNotFound')));
    return;
  }

  // 2) Returning user (no link) — try to reconnect to a saved session.
  const restored = restoreGameState();
  if (!restored || !P.roomCode) return;
  if (!api.isOnline()) { cleanupRoom(); return; }

  api.getRoom(P.roomCode).then(raw => {
    if (!raw || raw.phase === 'game_ended' || raw.phase === 'ended' || raw.phase === 'cancelled' || raw.phase === 'game_finished') {
      cleanupRoom();
      goTo('modeSelect');
      return;
    }
    applyRoomUpdate(raw);
    subscribeToRoom();
    waitForShell(() => {
      if (P.screen && P.screen.startsWith('ptakim')) {
        window.G.screen = P.screen;
        window.render();
      }
    });
  }).catch(() => {
    cleanupRoom();
    goTo('modeSelect');
  });
})();
