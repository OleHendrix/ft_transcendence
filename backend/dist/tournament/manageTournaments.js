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
exports.manageTournaments = manageTournaments;
const tournament_1 = require("./tournament");
const types_1 = require("../types/types");
function manageTournaments(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/tournament', (request, reply) => // rename
         __awaiter(this, void 0, void 0, function* () {
            for (const [id, lobby] of tournament_1.tournamentLobbies) {
                if (!lobby.rounds)
                    continue;
                let allFinished = true;
                for (const round of lobby.rounds) {
                    if (round.result === types_1.Result.PLAYING)
                        allFinished = false;
                    continue;
                }
                if (allFinished) {
                    let winners = [];
                    for (const round of lobby.rounds) {
                        winners.push(round.result === types_1.Result.P1WON ? round.p1 : round.p2);
                    }
                    lobby.players = winners;
                    lobby.rounds = [];
                    for (let i = 0; i < winners.length; i += 2) {
                        lobby.rounds.push({
                            p1: winners[i],
                            p2: winners[i + 1],
                            p1score: 0,
                            p2score: 0,
                            result: types_1.Result.PLAYING,
                        });
                    }
                }
            }
        }));
    });
}
