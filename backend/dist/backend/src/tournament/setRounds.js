"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRounds = setRounds;
const tournament_1 = require("./tournament");
const types_1 = require("../types/types");
function setRounds(tournamentId) {
    var _a;
    let lobby = tournament_1.tournamentLobbies.get(tournamentId);
    if (!lobby)
        return null;
    if (!lobby.rounds)
        lobby.rounds = [];
    for (let i = 0; i < lobby.players.length; i += 2) {
        (_a = lobby.rounds) === null || _a === void 0 ? void 0 : _a.push({
            p1: lobby.players[i],
            p2: lobby.players[i + 1],
            p1score: 0,
            p2score: 0,
            result: types_1.Result.PLAYING
        });
    }
}
