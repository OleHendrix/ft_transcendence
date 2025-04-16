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
exports.tournamentLobbies = void 0;
exports.setupTournament = setupTournament;
const createTournament_1 = require("./createTournament");
const getTournamentById_1 = require("./getTournamentById");
const getTournamentLobbies_1 = require("./getTournamentLobbies");
const joinTournament_1 = require("./joinTournament");
const manageTournament_1 = require("./manageTournament");
exports.tournamentLobbies = new Map();
function setupTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, createTournament_1.createTournament)(fastify);
        yield (0, getTournamentById_1.getTournamentById)(fastify);
        yield (0, getTournamentLobbies_1.getTournamentLobbies)(fastify);
        yield (0, joinTournament_1.joinTournament)(fastify);
        yield (0, manageTournament_1.manageTournament)(fastify);
    });
}
