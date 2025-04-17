"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTournament = createTournament;
const tournament_1 = require("./tournament");
function createTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(function (fastify) {
            return __awaiter(this, void 0, void 0, function* () {
                fastify.post('/api/create-tournament', (request, reply) => {
                    try {
                        const { hostId, hostUsername, maxPlayers } = request.body;
                        let tournamentId = 0;
                        while (tournament_1.tournamentLobbies.has(tournamentId))
                            tournamentId++;
                        const sockets = new Set();
                        const players = [];
                        const tournamentData = {
                            tournamentId,
                            // hostId,
                            hostUsername,
                            players,
                            maxPlayers: Number(maxPlayers),
                            rounds: null,
                            sockets,
                        };
                        tournament_1.tournamentLobbies.set(tournamentId, tournamentData);
                        // console.log(tournamentLobbies);
                        reply.send({ tournamentId: tournamentId });
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
            });
        });
    });
}
