import { Result, PlayerData } 			from "../types/types";
import { tournamentLobbies } 			from "./tournament";
import { allMatchesFinished } 			from "./manageTournament";
import { broadcastTournamentUpdate } 	from "./broadcastTournamentUpdates";

export function setResults(tournamentId: number, p1: number, p1score: number, p2score: number, result: Result)
{
	let tournament = tournamentLobbies.get(tournamentId);

	if (!tournament) 								return console.log(`setResults:tournamentId${tournamentId}:ERROR:ID_NOT_FOUND`);
	if (!tournament.rounds) 						return console.log(`setResults:tournament.rounds:ERROR:NOT_FOUND`);
	if (!tournament.rounds[tournament.roundIdx])	return console.log(`setResults:tournament.rounds[${tournament.roundIdx}]:ERROR:NOT_FOUND`);

	let round = tournament.rounds[tournament.roundIdx]?.find(round => round.p1.id === p1);
	if (!round) return console.log(`setResults:tournament.rounds[${tournament.roundIdx}].find(round => round.p1.id === p1):ERROR:NOT_FOUND`);

	round.state.p1Score = p1score;
	round.state.p2Score = p2score;
	round.state.result 	= result;

	if (!tournament.winners[tournament.roundIdx]) tournament.winners[tournament.roundIdx] = [];

	let winner: PlayerData;
	if (result === Result.P1WON || result === Result.DRAW) {
		winner = round.p1;
	} else if (result === Result.P2WON) {
		winner = round.p2;
	} else {
		return console.log(`setResults:ERROR:corrupted_resultState:${result}`);
	}

	const alreadyExists = tournament.winners[tournament.roundIdx].some(p => p.id === winner.id);
	if (!alreadyExists) {
		tournament.winners[tournament.roundIdx].push(winner);
		broadcastTournamentUpdate(tournamentId, "DATA");
	}

	const totalRounds = Math.log2(tournament.maxPlayers);
	console.log(totalRounds);
	if (tournament.roundIdx === totalRounds - 1)
	{
		console.log("FINAL ROUND WINNNER", winner);
		tournament.winner = winner;
		broadcastTournamentUpdate(tournamentId, "DATA");
	}

	if (allMatchesFinished(tournament))
	{
		tournament.readyForNextRound = true;
		broadcastTournamentUpdate(tournamentId, "DATA");
	}
}