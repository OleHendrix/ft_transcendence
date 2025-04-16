import { FastifyInstance } 		from "fastify";
import { TournamentData } 		from "../types/types";
import { createTournament } 	from "./createTournament";
import { getTournamentById } 	from "./getTournamentById";
import { getTournamentLobbies } from "./getTournamentLobbies";
import { joinTournament } 		from "./joinTournament";
import { manageTournament } 	from "./manageTournament";

export let tournamentLobbies = new Map<number, TournamentData>();


export async function setupTournament(fastify: FastifyInstance) {
	await createTournament(fastify);
	await getTournamentById(fastify);
	await getTournamentLobbies(fastify);
	await joinTournament(fastify);
	await manageTournament(fastify);
}