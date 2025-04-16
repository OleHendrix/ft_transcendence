import { Result } 				from "../types/types";
import { tournamentLobbies } 	from "./tournament";

export function setResults(tournamentId: number, p1: number, p1score: number, p2score: number, result: Result)
{
	let lobby = tournamentLobbies.get(tournamentId);
	if (!lobby)
		return ;

	let round = lobby.rounds?.find(round => round.p1.id === p1);
	if (!round)
		return ;

	round.p1score = p1score;
	round.p2score = p2score;
	round.result = result;
}