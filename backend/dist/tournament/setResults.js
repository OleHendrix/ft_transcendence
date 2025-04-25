"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setResults = setResults;
const tournament_1 = require("./tournament");
function setResults(tournamentId, p1, p1score, p2score, result) {
    var _a;
    let tournament = tournament_1.tournamentLobbies.get(tournamentId);
    if (!tournament)
        return console.log(`setResults:tournamentId${tournamentId}:ERROR:ID_NOT_FOUND`);
    if (!tournament.rounds)
        return console.log(`setResults:tournament.rounds:ERROR:NOT_FOUND`);
    if (!tournament.rounds[tournament.roundIdx])
        return console.log(`setResults:tournament.rounds[${tournament.roundIdx}]:ERROR:NOT_FOUND`);
    //what is dis
    let round = (_a = tournament.rounds[tournament.roundIdx]) === null || _a === void 0 ? void 0 : _a.find(round => round.p1.id === p1);
    if (!round)
        return console.log(`setResults:tournament.rounds[${tournament.roundIdx}].find(round => round.p1.id === p1):ERROR:NOT_FOUND`);
    round.state.p1Score = p1score;
    round.state.p2Score = p2score;
    round.state.result = result;
}
