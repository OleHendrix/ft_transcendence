import { Result } 				from "../types/types";
import { tournamentLobbies } 	from "./tournament";

export function setResults(tournamentId: number, p1: number, p1score: number, p2score: number, result: Result)
{
	let tournament = tournamentLobbies.get(tournamentId);

	if (!tournament) return console.log(`setResults:tournamentId${tournamentId}:ERROR:ID_NOT_FOUND`);
	if (!tournament.rounds) return console.log(`setResults:tournament.rounds:ERROR:NOT_FOUND`);
	if (!tournament.rounds[tournament.roundIdx]) return console.log(`setResults:tournament.rounds[${tournament.roundIdx}]:ERROR:NOT_FOUND`);

	//what is dis
	let round = tournament.rounds[tournament.roundIdx]?.find(round => round.p1.id === p1);
	if (!round) return console.log(`setResults:tournament.rounds[${tournament.roundIdx}].find(round => round.p1.id === p1):ERROR:NOT_FOUND`);

	round.state.p1Score = p1score;
	round.state.p2Score = p2score;
	round.state.result = result;
}