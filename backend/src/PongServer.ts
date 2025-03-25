import { PongState } from "../../frontend/src/types";

let	gameTable: {[key: number]: PongState} = {};


export function getGame(matchID: number): PongState
{
	if ((matchID in gameTable) === false)
		throw "Invalid matchID";
	return gameTable[matchID];
}

export function postGame(): number
{
	let key = 0;
	while (key in gameTable)
		key++;

	const state: PongState = {
		p1: {
			pos: { x: 3, y: 50},
			size: { x: 2, y: 20 },
			dir: { x: 0, y: 0 },
			colour: "#ff914d"
		},
		p2: {
			pos: { x: 95, y: 50},
			size: { x: 2, y: 20 },
			dir: { x: 0, y: 0 },
			colour: "#134588"
		},
		p1Score: 0,
		p2Score: 0,
		ball: {
			pos: { x: 50, y: 50 },
			prevPos: { x: 50, y: 50 },
			size: { x: 2, y: 2 },
			dir: { x: 1, y: 1 }
		}
	};
	//initBall(state.ball);

	gameTable[key] = state;
	return key;
}

export function deleteGame(matchID: number): void
{
	if ((matchID in gameTable) === false)
		throw "Invalid matchID";
	delete gameTable[matchID];
}

export function runGames(): void
{
	// loop through all games and update states
}