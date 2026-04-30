import { createClientFromRequest } from "npm:@base44/sdk";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { roomCode, deviceId } = await req.json();

    if (!roomCode || !deviceId) {
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

    // Verify the requester is the active clue giver
    if (!room.current_turn || room.phase !== "turn_active") {
      return Response.json({ error: "No active turn" }, { status: 400 });
    }

    const team = room.teams[room.current_turn.team_idx];
    if (!team) {
      return Response.json({ error: "Invalid team" }, { status: 400 });
    }

    // Find the active player — match by device ID in team's player list
    const activePlayerDeviceId = team.player_device_ids[room.current_turn.player_idx];
    if (activePlayerDeviceId !== deviceId) {
      // Not the active clue giver — privacy enforcement
      return Response.json({ error: "Not the active player" }, { status: 403 });
    }

    // Get the current note from the deck
    const noteIdx = room.deck_order[room.deck_index];
    if (noteIdx === undefined || noteIdx === null) {
      return Response.json({ error: "Deck empty" }, { status: 404 });
    }

    // Fetch the note by its index (service role — bypasses read restrictions)
    const notes = await base44.asServiceRole.entities.PtakimNote.filter(
      { room_code: roomCode, note_index: noteIdx },
      null, 1
    );

    if (notes.length === 0) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json({ success: true, text: notes[0].text, noteIndex: noteIdx });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
