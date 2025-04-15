import { tournamentLobbies } from "./tournament";
import { WebSocket } from "ws";

export function broadcastTournamentUpdate(tournamentId: number) {
	const tournament = tournamentLobbies.get(tournamentId);
	if (!tournament) return;

	const payload = {
		type: "TOURNAMENT_UPDATE",
		tournament: {
			tournamentId: tournament.tournamentId,
			hostUsername: tournament.hostUsername,
			maxPlayers: tournament.maxPlayers,
			players: tournament.players.map(p => p.username),
		},
	};
	console.log(`broadcast ${ JSON.stringify( tournament.players) }`);
	const message = JSON.stringify(payload);

	tournament.sockets.forEach(socket => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(message);
		}
	});
}
