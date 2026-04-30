import { createClientFromRequest } from "npm:@base44/sdk";

function shuffleArray(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { roomCode, deviceId, action, data } = await req.json();

    if (!roomCode || !deviceId || !action) {
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
    const isHost = room.host_device_id === deviceId;

    switch (action) {
      case "mark_ready": {
        const players = room.players.map((p: any) => {
          if (p.device_id === deviceId) return { ...p, ready: true };
          return p;
        });
        await base44.asServiceRole.entities.PtakimRoom.update(room.id, { players });
        break;
      }

      case "setup_teams": {
        if (!isHost) return Response.json({ error: "Only host can do this" }, { status: 403 });

        // Shuffle players into 2 teams
        const playerIds = room.players.map((p: any) => p.device_id);
        const shuffled = shuffleArray(playerIds.map((_: string, i: number) => i))
          .map((i: number) => playerIds[i]);

        const teamA: string[] = [];
        const teamB: string[] = [];
        shuffled.forEach((id: string, i: number) => {
          if (i % 2 === 0) teamA.push(id);
          else teamB.push(id);
        });

        const teams = [
          { name: "Team A", color: "#6C63FF", emoji: "🟣", player_device_ids: teamA, explainer_idx: 0, scores: [0, 0, 0] },
          { name: "Team B", color: "#16a34a", emoji: "🟢", player_device_ids: teamB, explainer_idx: 0, scores: [0, 0, 0] },
        ];

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          teams,
          phase: "submitting_notes",
        });
        break;
      }

      case "start_round": {
        if (!isHost) return Response.json({ error: "Only host can do this" }, { status: 403 });

        const roundNum = (data?.round) || (room.current_round + 1);
        if (roundNum < 1 || roundNum > 3) {
          return Response.json({ error: "Invalid round number" }, { status: 400 });
        }

        // Shuffle deck for this round
        const noteIndices = Array.from({ length: room.note_count }, (_, i) => i);
        const deckOrder = shuffleArray(noteIndices);

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          current_round: roundNum,
          deck_order: deckOrder,
          deck_index: 0,
          current_turn: {
            team_idx: 0,
            player_idx: room.teams[0]?.explainer_idx || 0,
            start_time: null,
            end_time: null,
          },
          phase: "round_intro",
          turn_results: null,
        });
        break;
      }

      case "start_turn": {
        const turn = room.current_turn;
        if (!turn) return Response.json({ error: "No current turn" }, { status: 400 });

        const now = new Date().toISOString();
        const end = new Date(Date.now() + 60000).toISOString();

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          current_turn: {
            ...turn,
            start_time: now,
            end_time: end,
          },
          phase: "turn_active",
        });
        break;
      }

      case "correct": {
        const deckIndex = room.deck_index + 1;
        const updates: any = { deck_index: deckIndex };

        // Check if deck is exhausted
        if (deckIndex >= room.deck_order.length) {
          // Record score and end round
          const turn = room.current_turn;
          const roundIdx = room.current_round - 1;
          const correct = (data?.turnCorrect || 0) + 1;
          const teams = [...room.teams];
          teams[turn.team_idx] = {
            ...teams[turn.team_idx],
            scores: teams[turn.team_idx].scores.map((s: number, i: number) =>
              i === roundIdx ? s + correct : s
            ),
          };
          updates.teams = teams;
          updates.phase = "round_result";
          updates.turn_results = {
            team_idx: turn.team_idx,
            player_idx: turn.player_idx,
            correct,
            skipped: data?.turnSkipped || 0,
            deck_empty: true,
          };
        }

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, updates);
        break;
      }

      case "skip": {
        if (!room.settings.skip_allowed) {
          return Response.json({ error: "Skipping not allowed" }, { status: 400 });
        }

        // Move current note to end of deck and advance pointer
        const newDeckOrder = [...room.deck_order];
        const currentNoteIdx = newDeckOrder[room.deck_index];
        newDeckOrder.push(currentNoteIdx);

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          deck_order: newDeckOrder,
          deck_index: room.deck_index + 1,
        });
        break;
      }

      case "end_turn": {
        const turn = room.current_turn;
        if (!turn) return Response.json({ error: "No current turn" }, { status: 400 });

        const roundIdx = room.current_round - 1;
        const correct = data?.turnCorrect || 0;
        const skipped = data?.turnSkipped || 0;
        const teams = [...room.teams];
        teams[turn.team_idx] = {
          ...teams[turn.team_idx],
          scores: teams[turn.team_idx].scores.map((s: number, i: number) =>
            i === roundIdx ? s + correct : s
          ),
        };

        const deckEmpty = room.deck_index >= room.deck_order.length;

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          teams,
          phase: deckEmpty ? "round_result" : "turn_result",
          turn_results: {
            team_idx: turn.team_idx,
            player_idx: turn.player_idx,
            correct,
            skipped,
            deck_empty: deckEmpty,
          },
        });
        break;
      }

      case "next_turn": {
        const turn = room.current_turn;
        if (!turn) return Response.json({ error: "No current turn" }, { status: 400 });

        const nextTeamIdx = (turn.team_idx + 1) % room.teams.length;
        const teams = [...room.teams];

        // Advance explainer if we've cycled through all teams
        if (nextTeamIdx <= turn.team_idx) {
          teams.forEach((team: any) => {
            team.explainer_idx = (team.explainer_idx + 1) % team.player_device_ids.length;
          });
        }

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          teams,
          current_turn: {
            team_idx: nextTeamIdx,
            player_idx: teams[nextTeamIdx].explainer_idx,
            start_time: null,
            end_time: null,
          },
          phase: "turn_active",
          turn_results: null,
        });
        break;
      }

      case "next_round": {
        if (!isHost) return Response.json({ error: "Only host can do this" }, { status: 403 });

        const nextRound = room.current_round + 1;
        if (nextRound > 3) {
          await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
            phase: "game_finished",
          });
        } else {
          const noteIndices = Array.from({ length: room.note_count }, (_, i) => i);
          const deckOrder = shuffleArray(noteIndices);

          await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
            current_round: nextRound,
            deck_order: deckOrder,
            deck_index: 0,
            current_turn: {
              team_idx: 0,
              player_idx: room.teams[0]?.explainer_idx || 0,
              start_time: null,
              end_time: null,
            },
            phase: "round_intro",
            turn_results: null,
          });
        }
        break;
      }

      case "start_game": {
        if (!isHost) return Response.json({ error: "Only host can do this" }, { status: 403 });

        let teams;
        if (data?.teams && data.teams.length >= 2) {
          teams = data.teams.map((t: any) => ({
            name: t.name,
            color: t.color,
            emoji: t.emoji,
            player_device_ids: t.playerDeviceIds || t.player_device_ids || [],
            explainer_idx: 0,
            scores: [0, 0, 0],
          }));
        } else {
          const playerIds = room.players.map((p: any) => p.device_id);
          const shuffled = shuffleArray(playerIds.map((_: string, i: number) => i))
            .map((i: number) => playerIds[i]);
          const teamA: string[] = [];
          const teamB: string[] = [];
          shuffled.forEach((id: string, i: number) => {
            if (i % 2 === 0) teamA.push(id);
            else teamB.push(id);
          });
          teams = [
            { name: "Team A", color: "#6C63FF", emoji: "🟣", player_device_ids: teamA, explainer_idx: 0, scores: [0, 0, 0] },
            { name: "Team B", color: "#16a34a", emoji: "🟢", player_device_ids: teamB, explainer_idx: 0, scores: [0, 0, 0] },
          ];
        }

        const noteIndices = Array.from({ length: room.note_count }, (_, i) => i);
        const deckOrder = shuffleArray(noteIndices);

        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          teams,
          current_round: 1,
          deck_order: deckOrder,
          deck_index: 0,
          current_turn: {
            team_idx: 0,
            player_idx: 0,
            start_time: null,
            end_time: null,
          },
          phase: "round_intro",
          turn_results: null,
        });
        break;
      }

      case "set_phase": {
        if (!isHost) return Response.json({ error: "Only host can do this" }, { status: 403 });
        await base44.asServiceRole.entities.PtakimRoom.update(room.id, {
          phase: data?.phase,
        });
        break;
      }

      case "update_teams": {
        if (!isHost) return Response.json({ error: "Only host can do this" }, { status: 403 });
        if (data?.teams) {
          const teams = data.teams.map((t: any) => ({
            name: t.name,
            color: t.color,
            emoji: t.emoji,
            player_device_ids: t.playerDeviceIds || t.player_device_ids || [],
            explainer_idx: t.explainerIdx || t.explainer_idx || 0,
            scores: t.scores || [0, 0, 0],
          }));
          await base44.asServiceRole.entities.PtakimRoom.update(room.id, { teams });
        }
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Return updated room state
    const updatedRoom = await base44.asServiceRole.entities.PtakimRoom.get(room.id);
    return Response.json({ success: true, room: updatedRoom, server_time: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
