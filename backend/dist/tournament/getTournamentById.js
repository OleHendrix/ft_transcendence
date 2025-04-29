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
exports.getTournamentById = getTournamentById;
const tournament_1 = require("./tournament");
function getTournamentById(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/api/tournament-data/:id', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            const tournamentId = parseInt(id, 10);
            if (isNaN(tournamentId) || tournamentId === -1) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }
            const tournament = tournament_1.tournamentLobbies.get(tournamentId);
            if (!tournament) {
                return reply.status(404).send({ error: "Tournament not found" });
            }
            return reply.send(tournament);
        }));
    });
}
