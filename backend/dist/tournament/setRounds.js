"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMatches = setMatches;
const tournament_1 = require("./tournament");
const types_1 = require("../types/types");
function setMatches(tournamentId) {
    var _a;
    let tournament = tournament_1.tournamentLobbies.get(tournamentId);
    if (!tournament) {
        console.log(`setMatches:tournamentId:${tournamentId}:ERROR:ID_NOT_FOUND`);
        return null;
    }
    if (!tournament.rounds)
        tournament.rounds = [];
    for (let i = 0; i < tournament.players.length; i += 2) {
        (_a = tournament.rounds) === null || _a === void 0 ? void 0 : _a.push({
            p1: tournament.players[i],
            p2: tournament.players[i + 1],
            p1score: 0,
            p2score: 0,
            result: types_1.Result.PLAYING
        });
    }
}
