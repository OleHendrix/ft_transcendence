export default interface Player
{
	username: string;
	email: string;
	password: string;
	wins: number;
	draws: number;
	loses: number;
}

interface Vec2 {
	x: number;
	y: number;
}

interface Colour {
	r: number;
	g: number;
	b: number;
	a: number;
}

interface Paddle {
	pos: Vec2;
	size: Vec2;
	dir: Vec2;
	colour: Colour;
}

interface Ball {
	pos: Vec2;
	previousPos: Vec2;
	size: Vec2;
	dir: Vec2;
	img: HTMLImageElement;

	sizeArray: Array<Vec2>;
	imgArray: Array<HTMLImageElement>;
	arraySize: number;
}

export default interface Pong {
	player1: Paddle;
	player2: Paddle;
	ball: Ball;
	score1: number;
	score2: number;
	isPaused: boolean;
}

export default interface Statics {
	ballBounce: Vec2;
}

export default interface AI {
	enabled: boolean;
	lastActivation: number;
	desiredY: number;
}

let canvas: HTMLCanvasElement;
let imageData: ImageData;
// let pong: Pong;
// let statics: Statics;
// let ai: AI;

// export default Player;