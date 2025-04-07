"use strict";
// +--------------------------------------------------------------------------+
// |               WARNING: is a duplicate of frontend/types.ts               |
// +--------------------------------------------------------------------------+
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = exports.Opponent = void 0;
var Opponent;
(function (Opponent) {
    Opponent[Opponent["AI"] = -1] = "AI";
    Opponent[Opponent["ANY"] = -2] = "ANY";
})(Opponent || (exports.Opponent = Opponent = {}));
;
var Result;
(function (Result) {
    Result[Result["PLAYING"] = 0] = "PLAYING";
    Result[Result["P1WON"] = 1] = "P1WON";
    Result[Result["P2WON"] = 2] = "P2WON";
    Result[Result["DRAW"] = 3] = "DRAW";
})(Result || (exports.Result = Result = {}));
;
;
