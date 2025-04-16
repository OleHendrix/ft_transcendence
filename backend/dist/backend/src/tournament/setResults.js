"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setResults = setResults;
const tournament_1 = require("./tournament");
function setResults(tournamentId, p1, p1score, p2score, result) {
    var _a;
    let lobby = tournament_1.tournamentLobbies.get(tournamentId);
    if (!lobby)
        return;
    let round = (_a = lobby.rounds) === null || _a === void 0 ? void 0 : _a.find(round => round.p1.id === p1);
    if (!round)
        return;
    round.p1score = p1score;
    round.p2score = p2score;
    round.result = result;
}
