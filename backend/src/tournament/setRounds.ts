import { tournamentLobbies } 	from "./tournament";
import { Result } 				from "../types/types"

export function setRounds(tournamentId: number)
{
	let lobby = tournamentLobbies.get(tournamentId);
	if (!lobby) return null;

	if (!lobby.rounds) lobby.rounds = [];

	for (let i = 0; i < lobby.players.length; i += 2)
	{
		lobby.rounds?.push({
			p1:			lobby.players[i],
			p2:			lobby.players[i + 1],
			p1score:	0,
			p2score:	0,
			result:		Result.PLAYING
		});
	}
}