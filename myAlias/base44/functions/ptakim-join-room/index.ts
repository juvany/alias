import { createClientFromRequest } from "npm:@base44/sdk";

const EMOJIS = ['😎','🤩','🧐','🤠','👻','🦊','🐸','🦁','🐯','🐻','🦄','🎃'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { roomCode, deviceId, playerName } = await req.json();

    if (!roomCode || !deviceId || !playerName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find room
    const rooms = await base44.asServiceRole.entities.PtakimRoom.filter(
      { room_code: roomCode.toUpperCase() },
      "-created_date", 1
    );

    if (rooms.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];

    if (room.phase !== "lobby") {
      return Response.json({ error: "Game already started" }, { status: 400 });
    }

    // Check if player already in room (rejoin)
    const existingIdx = room.players.findIndex((p: any) => p.device_id === deviceId);
    if (existingIdx >= 0) {
      // Update name and rejoin
      room.players[existingIdx].name = playerName;
      await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
        players: room.players,
      });
      return Response.json({ success: true, room, roomId: room.id });
    }

    // Check for duplicate name
    const nameTaken = room.players.some((p: any) => p.name === playerName);
    if (nameTaken) {
      return Response.json({ error: "Name already taken" }, { status: 409 });
    }

    // Add player
    const newPlayer = {
      device_id: deviceId,
      name: playerName,
      ready: false,
      notes_submitted: false,
      emoji: EMOJIS[room.players.length % EMOJIS.length],
    };

    const updatedPlayers = [...room.players, newPlayer];
    await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
      players: updatedPlayers,
    });

    const updatedRoom = await base44.asServiceRole.entities.PtakimRoom.get(room.id);
    return Response.json({ success: true, room: updatedRoom, roomId: room.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
