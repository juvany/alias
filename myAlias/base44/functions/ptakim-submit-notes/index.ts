import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { roomCode, deviceId, notes } = await req.json();

    if (!roomCode || !deviceId || !Array.isArray(notes) || notes.length === 0) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find room
    const rooms = await base44.asServiceRole.entities.PtakimRoom.filter(
      { room_code: roomCode },
      null, 1
    );

    if (rooms.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];

    // Verify player is in room
    const player = room.players.find((p: any) => p.device_id === deviceId);
    if (!player) {
      return Response.json({ error: "Player not in room" }, { status: 403 });
    }

    // Create note entities (service role so they're admin-only readable)
    const startIdx = room.note_count || 0;
    const noteEntities = notes.map((text: string, i: number) => ({
      room_code: roomCode,
      text: text.trim(),
      author_device_id: deviceId,
      note_index: startIdx + i,
    }));

    await base44.asServiceRole.entities.PtakimNote.bulkCreate(noteEntities);

    // Update player's notes_submitted flag and note count
    const updatedPlayers = room.players.map((p: any) => {
      if (p.device_id === deviceId) {
        return { ...p, notes_submitted: true };
      }
      return p;
    });

    await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
      players: updatedPlayers,
      note_count: startIdx + notes.length,
    });

    return Response.json({ success: true, noteCount: startIdx + notes.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
