import { tournamentLobbies } from "./tournament";
import { WebSocket }		from "ws";


export function broadcastTournamentUpdate(tournamentId: number, type: string) {
	const tournament = tournamentLobbies.get(tournamentId);
	if (!tournament) return;
	
	let payload;
	if (type === "UPDATE")
	{
		payload = 
		{
			type,
			tournament:
			{
				tournamentId: 	tournament.tournamentId,
				hostId: 		tournament.hostId,
				hostUsername: 	tournament.hostUsername,
				maxPlayers:	 	tournament.maxPlayers,
				players: 		tournament.players,
				winners: 		tournament.winners,
				roundIdx: 		tournament.roundIdx,
				rounds: 		tournament.rounds
			}
		};
	}

	else if (type === "START_SIGNAL")
	{
		payload = {
			type,
			data: {
				start: true,
			}
		};
	}

	else if (type === "READY_FOR_NEXT_ROUND")
	{
		payload = {
			type,
			data: {
				ready: true,
			}
		}
	}
	else {
		console.warn("Unknown broadcast type:", type);
		return;
	}

	const message = JSON.stringify(payload);

	tournament.sockets.forEach(socket => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(message);
		}
	});
}

