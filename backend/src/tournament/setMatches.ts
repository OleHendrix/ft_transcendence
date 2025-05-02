import { initGame } 			from "../pong/pongLogic";
import { TournamentData } 		from "../types/types";

export function setMatches(tournament: TournamentData)
{
	if (!tournament.rounds) tournament.rounds = [];

	const idx = tournament.roundIdx;
	if (!tournament.rounds[idx]) tournament.rounds[idx] = [];
	if (tournament.roundIdx > 0)
	{
		const winners = tournament.winners[idx - 1];
		for (let i = 0; i < winners.length; i += 2)
		{
			tournament.rounds[idx]?.push(
			{
				state:			initGame(winners[i], winners[i+1]),
				p1:				winners[i],
				p2:				winners[i + 1],
				isLocalGame:	false,
				tournamentId:	tournament.tournamentId
			});
		}
		return ;
	}

	for (let i = 0; i < tournament.players.length; i += 2)
	{
		tournament.rounds[0]?.push(
		{
			state:		initGame(tournament.players[i], tournament.players[i+1]),
			p1:			tournament.players[i],
			p2:			tournament.players[i + 1],
			isLocalGame: false,
			tournamentId: tournament.tournamentId
		});
	}
}