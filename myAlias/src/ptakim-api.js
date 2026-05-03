/* =====================================================
   PTAKIM API — Base44 entity operations with mock fallback
   =====================================================
   Uses direct entity CRUD (no auth required) instead of
   backend functions. Note privacy is handled by the UI
   (press-hold reveal) rather than server-side enforcement.
   ===================================================== */
import { createClient } from '@base44/sdk';

const appId = import.meta.env.VITE_BASE44_APP_ID;
let base44 = null;
let _subscription = null;

function getClient() {
  if (!base44 && appId) {
    base44 = createClient({ appId });
  }
  return base44;
}

export function isOnline() {
  return !!appId;
}

/* =====================================================
   HELPERS
   ===================================================== */
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return code;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EMOJIS = ['😎','🤩','🧐','🤠','👻','🦊','🐸','🦁','🐯','🐻','🦄','🎃'];

/* =====================================================
   REAL-TIME SUBSCRIPTION
   ===================================================== */
export function subscribeToRoom(roomId, callback) {
  const client = getClient();
  if (!client) return () => {};

  if (_subscription) { _subscription(); _subscription = null; }

  _subscription = client.entities.PtakimRoom.subscribe((event) => {
    if (event.id === roomId) {
      callback(event.data);
    }
  });

  return () => {
    if (_subscription) { _subscription(); _subscription = null; }
  };
}

/* =====================================================
   ROOM OPERATIONS (direct entity CRUD)
   ===================================================== */
export async function createRoom(deviceId, playerName, settings) {
  const client = getClient();
  if (!client) return null;

  // Generate unique room code
  let roomCode = generateRoomCode();
  for (let i = 0; i < 5; i++) {
    const existing = await client.entities.PtakimRoom.filter({ room_code: roomCode }, null, 1);
    if (existing.length === 0) break;
    roomCode = generateRoomCode();
  }

  const room = await client.entities.PtakimRoom.create({
    room_code: roomCode,
    host_device_id: deviceId,
    phase: 'lobby',
    settings: {
      notes_per_player: settings?.notesPerPlayer || 5,
      skip_allowed: settings?.skipAllowed !== false,
      team_mode: settings?.teamMode || 'auto',
    },
    players: [{
      device_id: deviceId,
      name: playerName,
      ready: false,
      notes_submitted: false,
      emoji: EMOJIS[0],
    }],
    teams: [],
    notes: [],
    note_count: 0,
    current_round: 0,
    current_turn: null,
    deck_order: [],
    deck_index: 0,
    turn_results: null,
  });

  return { success: true, roomCode, roomId: room.id, room };
}

export async function joinRoom(roomCode, deviceId, playerName) {
  const client = getClient();
  if (!client) return { error: 'No client' };

  const rooms = await client.entities.PtakimRoom.filter(
    { room_code: roomCode.toUpperCase() },
    '-created_date', 1
  );

  if (rooms.length === 0) return { error: 'Room not found' };
  const room = rooms[0];

  // Always allow existing players to rejoin (reconnect after reload / deeplink),
  // regardless of phase. Only block BRAND-NEW joiners once the game is underway.
  const existingIdx = room.players.findIndex(p => p.device_id === deviceId);
  if (existingIdx >= 0) {
    room.players[existingIdx].name = playerName;
    await client.entities.PtakimRoom.update(room.id, { players: room.players });
    return { success: true, room, roomId: room.id };
  }

  if (room.phase !== 'lobby') return { error: 'Game already started' };

  // Check duplicate name
  if (room.players.some(p => p.name === playerName)) {
    return { error: 'Name already taken' };
  }

  const updatedPlayers = [...room.players, {
    device_id: deviceId,
    name: playerName,
    ready: false,
    notes_submitted: false,
    emoji: EMOJIS[room.players.length % EMOJIS.length],
  }];

  await client.entities.PtakimRoom.update(room.id, { players: updatedPlayers });
  const updated = await client.entities.PtakimRoom.get(room.id);
  return { success: true, room: updated, roomId: room.id };
}

export async function joinAndSubmitNotes(roomCode, deviceId, playerName, notes) {
  const client = getClient();
  if (!client) return { error: 'No client' };

  const rooms = await client.entities.PtakimRoom.filter(
    { room_code: roomCode.toUpperCase() },
    '-created_date', 1
  );

  if (rooms.length === 0) return { error: 'Room not found' };
  const room = rooms[0];

  // Always allow existing players to rejoin (reconnect after reload / deeplink),
  // regardless of phase. Only block BRAND-NEW joiners once the game is underway.
  const existingIdx = room.players.findIndex(p => p.device_id === deviceId);
  if (existingIdx >= 0) {
    room.players[existingIdx].name = playerName;
    room.players[existingIdx].notes_submitted = true;
    await client.entities.PtakimRoom.update(room.id, { players: room.players });
    const updated = await client.entities.PtakimRoom.get(room.id);
    return { success: true, room: updated, roomId: room.id };
  }

  if (room.phase !== 'lobby') return { error: 'Game already started' };

  // Check duplicate name
  if (room.players.some(p => p.name === playerName)) {
    return { error: 'Name already taken' };
  }

  // Add player + notes in one update
  const updatedPlayers = [...room.players, {
    device_id: deviceId,
    name: playerName,
    ready: true,
    notes_submitted: true,
    emoji: EMOJIS[room.players.length % EMOJIS.length],
  }];

  const startIdx = room.note_count || 0;
  const newNotes = notes.map((text, i) => ({
    text: text.trim(),
    author_device_id: deviceId,
    note_index: startIdx + i,
  }));
  const allNotes = [...(room.notes || []), ...newNotes];

  await client.entities.PtakimRoom.update(room.id, {
    players: updatedPlayers,
    notes: allNotes,
    note_count: startIdx + notes.length,
  });

  const updated = await client.entities.PtakimRoom.get(room.id);
  return { success: true, room: updated, roomId: room.id };
}

export async function submitNotes(roomCode, deviceId, notes) {
  const client = getClient();
  if (!client) return null;

  const rooms = await client.entities.PtakimRoom.filter({ room_code: roomCode }, null, 1);
  if (rooms.length === 0) return null;
  const room = rooms[0];

  const startIdx = room.note_count || 0;
  const newNotes = notes.map((text, i) => ({
    text: text.trim(),
    author_device_id: deviceId,
    note_index: startIdx + i,
  }));

  // Store notes in the room entity itself (simpler, no separate entity needed)
  const allNotes = [...(room.notes || []), ...newNotes];
  const updatedPlayers = room.players.map(p => {
    if (p.device_id === deviceId) return { ...p, notes_submitted: true };
    return p;
  });

  await client.entities.PtakimRoom.update(room.id, {
    notes: allNotes,
    note_count: startIdx + notes.length,
    players: updatedPlayers,
  });

  return { success: true, noteCount: startIdx + notes.length };
}

export async function updatePlayerName(roomCode, deviceId, newName) {
  const client = getClient();
  if (!client) return null;

  const rooms = await client.entities.PtakimRoom.filter({ room_code: roomCode }, null, 1);
  if (rooms.length === 0) return { error: 'Room not found' };
  const room = rooms[0];

  const trimmed = (newName || '').trim();
  if (!trimmed) return { error: 'Empty name' };
  if (room.players.some(p => p.name === trimmed && p.device_id !== deviceId)) {
    return { error: 'Name already taken' };
  }

  const updatedPlayers = room.players.map(p =>
    p.device_id === deviceId ? { ...p, name: trimmed } : p
  );
  await client.entities.PtakimRoom.update(room.id, { players: updatedPlayers });
  const updated = await client.entities.PtakimRoom.get(room.id);
  return { success: true, room: updated };
}

export async function addMockPlayers(roomCode, count) {
  const client = getClient();
  if (!client) return null;

  const rooms = await client.entities.PtakimRoom.filter({ room_code: roomCode }, null, 1);
  if (rooms.length === 0) return { error: 'Room not found' };
  const room = rooms[0];

  const mockNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry'];
  const mockWords = ['Einstein', 'Napoleon', 'Cleopatra', 'Shakespeare', 'Mozart', 'Batman', 'Superman', 'Harry Potter', 'Sherlock Holmes', 'James Bond'];
  const notesPerPlayer = room.settings?.notes_per_player || 5;

  const newPlayers = [];
  const newNotes = [...(room.notes || [])];
  let noteIdx = room.note_count || 0;

  for (let i = 0; i < count; i++) {
    const base = room.players.length + newPlayers.length;
    const deviceId = 'mock_' + Math.random().toString(36).slice(2, 10);
    const name = mockNames[base % mockNames.length] + '_' + base;
    newPlayers.push({
      device_id: deviceId,
      name,
      ready: true,
      notes_submitted: true,
      emoji: EMOJIS[base % EMOJIS.length],
    });
    for (let j = 0; j < notesPerPlayer; j++) {
      newNotes.push({
        text: mockWords[noteIdx % mockWords.length],
        author_device_id: deviceId,
        note_index: noteIdx,
      });
      noteIdx++;
    }
  }

  await client.entities.PtakimRoom.update(room.id, {
    players: [...room.players, ...newPlayers],
    notes: newNotes,
    note_count: noteIdx,
  });
  const updated = await client.entities.PtakimRoom.get(room.id);
  return { success: true, room: updated };
}

export async function getRoom(roomCode) {
  const client = getClient();
  if (!client) return null;

  const rooms = await client.entities.PtakimRoom.filter(
    { room_code: roomCode },
    '-created_date', 1
  );
  return rooms.length > 0 ? rooms[0] : null;
}


export async function getRoomById(roomId) {
  const client = getClient();
  if (!client) return null;
  return await client.entities.PtakimRoom.get(roomId);
}

/* =====================================================
   GAME ACTIONS (direct entity updates)
   ===================================================== */
export async function gameAction(roomCode, deviceId, action, data) {
  const client = getClient();
  if (!client) return null;

  const rooms = await client.entities.PtakimRoom.filter({ room_code: roomCode }, null, 1);
  if (rooms.length === 0) return null;
  const room = rooms[0];

  const updates = {};

  switch (action) {
    case 'mark_ready': {
      updates.players = room.players.map(p => {
        if (p.device_id === deviceId) return { ...p, ready: true };
        return p;
      });
      break;
    }

    case 'setup_teams': {
      const playerIds = room.players.map(p => p.device_id);
      const shuffled = shuffleArray(playerIds);
      const teamA = [], teamB = [];
      shuffled.forEach((id, i) => {
        if (i % 2 === 0) teamA.push(id);
        else teamB.push(id);
      });

      updates.teams = [
        { name: 'Team A', color: '#6C63FF', emoji: '🟣', player_device_ids: teamA, explainer_idx: 0, scores: [0, 0, 0] },
        { name: 'Team B', color: '#16a34a', emoji: '🟢', player_device_ids: teamB, explainer_idx: 0, scores: [0, 0, 0] },
      ];
      updates.phase = 'submitting_notes';
      break;
    }

    case 'start_round': {
      const roundNum = data?.round || (room.current_round + 1);
      const noteIndices = Array.from({ length: room.note_count }, (_, i) => i);
      updates.current_round = roundNum;
      updates.deck_order = shuffleArray(noteIndices);
      updates.deck_index = 0;
      updates.current_turn = {
        team_idx: 0,
        player_idx: room.teams[0]?.explainer_idx || 0,
        start_time: null,
        end_time: null,
      };
      updates.phase = 'round_intro';
      updates.turn_results = null;
      break;
    }

    case 'start_turn': {
      const turn = room.current_turn;
      if (!turn) break;
      updates.current_turn = {
        ...turn,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 60000).toISOString(),
      };
      updates.phase = 'turn_active';
      break;
    }

    case 'pause_turn': {
      const turn = room.current_turn;
      if (!turn || turn.paused) break;
      const endTime = turn.end_time ? new Date(turn.end_time).getTime() : 0;
      const remaining = Math.max(0, endTime - Date.now());
      updates.current_turn = { ...turn, paused: true, paused_remaining_ms: remaining };
      break;
    }

    case 'resume_turn': {
      const turn = room.current_turn;
      if (!turn || !turn.paused) break;
      const remaining = turn.paused_remaining_ms || 0;
      updates.current_turn = {
        ...turn,
        paused: false,
        paused_remaining_ms: 0,
        end_time: new Date(Date.now() + remaining).toISOString(),
      };
      break;
    }

    case 'correct': {
      updates.deck_index = room.deck_index + 1;
      break;
    }

    case 'skip': {
      if (!room.settings.skip_allowed) break;
      const newDeck = [...room.deck_order];
      newDeck.push(newDeck[room.deck_index]);
      updates.deck_order = newDeck;
      updates.deck_index = room.deck_index + 1;
      break;
    }

    case 'end_turn': {
      const turn = room.current_turn;
      if (!turn) break;
      const roundIdx = room.current_round - 1;
      const correct = data?.turnCorrect || 0;
      const teams = room.teams.map((t, i) => {
        if (i === turn.team_idx) {
          const scores = [...t.scores];
          scores[roundIdx] += correct;
          return { ...t, scores };
        }
        return t;
      });
      const deckEmpty = room.deck_index >= room.deck_order.length;
      updates.teams = teams;
      // If deck is empty and we're on the last round, skip 'round_result' and
      // go straight to 'game_finished' so clients jump to the celebration screen.
      const isFinal = deckEmpty && (room.current_round >= 3);
      updates.phase = isFinal ? 'game_finished' : (deckEmpty ? 'round_result' : 'turn_result');
      updates.turn_results = {
        team_idx: turn.team_idx,
        player_idx: turn.player_idx,
        correct,
        skipped: data?.turnSkipped || 0,
        deck_empty: deckEmpty,
      };
      break;
    }

    case 'next_turn': {
      const turn = room.current_turn;
      if (!turn) break;
      const nextTeamIdx = (turn.team_idx + 1) % room.teams.length;
      const teams = room.teams.map((t, i) => {
        if (nextTeamIdx <= turn.team_idx) {
          return { ...t, explainer_idx: (t.explainer_idx + 1) % t.player_device_ids.length };
        }
        return t;
      });
      updates.teams = teams;
      updates.current_turn = {
        team_idx: nextTeamIdx,
        player_idx: teams[nextTeamIdx].explainer_idx,
        start_time: null,
        end_time: null,
      };
      updates.phase = 'turn_active';
      updates.turn_results = null;
      break;
    }

    case 'next_round': {
      const nextRound = room.current_round + 1;
      if (nextRound > 3) {
        updates.phase = 'game_finished';
      } else {
        const noteIndices = Array.from({ length: room.note_count }, (_, i) => i);
        updates.current_round = nextRound;
        updates.deck_order = shuffleArray(noteIndices);
        updates.deck_index = 0;
        updates.current_turn = {
          team_idx: 0,
          player_idx: room.teams[0]?.explainer_idx || 0,
          start_time: null,
          end_time: null,
        };
        updates.phase = 'round_intro';
        updates.turn_results = null;
      }
      break;
    }

    case 'start_game': {
      if (data?.teams && data.teams.length >= 2) {
        updates.teams = data.teams.map(t => ({
          name: t.name,
          color: t.color,
          emoji: t.emoji,
          player_device_ids: t.playerDeviceIds || t.player_device_ids || [],
          explainer_idx: 0,
          scores: [0, 0, 0],
        }));
      } else {
        const playerIds = room.players.map(p => p.device_id);
        const shuffled = shuffleArray(playerIds);
        const teamA = [], teamB = [];
        shuffled.forEach((id, i) => {
          if (i % 2 === 0) teamA.push(id);
          else teamB.push(id);
        });
        updates.teams = [
          { name: 'Team A', color: '#6C63FF', emoji: '🟣', player_device_ids: teamA, explainer_idx: 0, scores: [0, 0, 0] },
          { name: 'Team B', color: '#16a34a', emoji: '🟢', player_device_ids: teamB, explainer_idx: 0, scores: [0, 0, 0] },
        ];
      }
      const noteIndices = Array.from({ length: room.note_count }, (_, i) => i);
      updates.current_round = 1;
      updates.deck_order = shuffleArray(noteIndices);
      updates.deck_index = 0;
      updates.current_turn = {
        team_idx: 0,
        player_idx: 0,
        start_time: null,
        end_time: null,
      };
      updates.phase = 'round_intro';
      updates.turn_results = null;
      break;
    }

    case 'set_phase': {
      updates.phase = data?.phase;
      break;
    }

    case 'update_teams': {
      if (data?.teams) {
        updates.teams = data.teams.map(t => ({
          name: t.name,
          color: t.color,
          emoji: t.emoji,
          player_device_ids: t.playerDeviceIds || t.player_device_ids || [],
          explainer_idx: t.explainerIdx || t.explainer_idx || 0,
          scores: t.scores || [0, 0, 0],
        }));
        // Skip the post-write fetch — the Base44 get can return a stale
        // snapshot right after a write, which would wipe our local update.
        // Subscription will carry the authoritative state shortly anyway.
        if (Object.keys(updates).length > 0) {
          await client.entities.PtakimRoom.update(room.id, updates);
        }
        return { success: true, server_time: new Date().toISOString() };
      }
      break;
    }

    case 'ping': {
      // Clock-sync probe: return server time; no mutation, no refetch
      return { success: true, server_time: new Date().toISOString() };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }

  if (Object.keys(updates).length > 0) {
    await client.entities.PtakimRoom.update(room.id, updates);
  }

  const updated = await client.entities.PtakimRoom.get(room.id);
  return { success: true, room: updated, server_time: new Date().toISOString() };
}

/* =====================================================
   NOTE ACCESS (from room entity directly)
   ===================================================== */
export async function getNote(roomCode, deviceId) {
  const client = getClient();
  if (!client) return null;

  const rooms = await client.entities.PtakimRoom.filter({ room_code: roomCode }, null, 1);
  if (rooms.length === 0) return null;
  const room = rooms[0];

  const noteIdx = room.deck_order?.[room.deck_index];
  if (noteIdx === undefined || noteIdx === null) return null;

  const note = room.notes?.[noteIdx];
  if (!note) return null;

  return { success: true, text: note.text, noteIndex: noteIdx };
}
