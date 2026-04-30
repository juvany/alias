import { createClientFromRequest } from "npm:@base44/sdk";

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { deviceId, playerName, settings } = await req.json();

    if (!deviceId || !playerName) {
      return Response.json({ error: "Missing deviceId or playerName" }, { status: 400 });
    }

    // Generate unique room code (retry if collision)
    let roomCode = generateRoomCode();
    let retries = 5;
    while (retries > 0) {
      const existing = await base44.asServiceRole.entities.PtakimRoom.filter(
        { room_code: roomCode, phase: { $ne: "game_finished" } },
        null, 1
      );
      if (existing.length === 0) break;
      roomCode = generateRoomCode();
      retries--;
    }

    const room = await base44.asServiceRole.entities.PtakimRoom.create({
      room_code: roomCode,
      host_device_id: deviceId,
      phase: "lobby",
      settings: {
        notes_per_player: settings?.notesPerPlayer || 5,
        skip_allowed: settings?.skipAllowed !== false,
        team_mode: settings?.teamMode || "auto",
      },
      players: [{
        device_id: deviceId,
        name: playerName,
        ready: false,
        notes_submitted: false,
        emoji: "😎",
      }],
      teams: [],
      note_count: 0,
      current_round: 0,
      current_turn: null,
      deck_order: [],
      deck_index: 0,
      turn_results: null,
    });

    return Response.json({ success: true, roomCode, roomId: room.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
