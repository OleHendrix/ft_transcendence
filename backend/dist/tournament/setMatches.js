"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMatches = setMatches;
const pongLogic_1 = require("../pong/pongLogic");
const broadcastTournamentUpdates_1 = require("./broadcastTournamentUpdates");
function setMatches(tournament) {
    var _a, _b;
    if (!tournament.rounds)
        tournament.rounds = [];
    const idx = tournament.roundIdx;
    if (!tournament.rounds[idx])
        tournament.rounds[idx] = [];
    if (tournament.roundIdx > 0) {
        const winners = tournament.winners[idx - 1];
        for (let i = 0; i < winners.length; i += 2) {
            (_a = tournament.rounds[idx]) === null || _a === void 0 ? void 0 : _a.push({
                state: (0, pongLogic_1.initGame)(winners[i], winners[i + 1]),
                p1: winners[i],
                p2: winners[i + 1],
                isLocalGame: false,
                tournamentId: tournament.tournamentId
            });
        }
        return;
    }
    for (let i = 0; i < tournament.players.length; i += 2) {
        (_b = tournament.rounds[0]) === null || _b === void 0 ? void 0 : _b.push({
            state: (0, pongLogic_1.initGame)(tournament.players[i], tournament.players[i + 1]),
            p1: tournament.players[i],
            p2: tournament.players[i + 1],
            isLocalGame: false,
            tournamentId: tournament.tournamentId
        });
    }
    (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournament.tournamentId, "UPDATE");
}
