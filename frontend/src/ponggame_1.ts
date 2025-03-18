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

interface Pong {
	player1: Paddle;
	player2: Paddle;
	ball: Ball;
	score1: number;
	score2: number;
	isPaused: boolean;
}

interface Statics {
	ballBounce: Vec2;
}

interface AI {
	enabled: boolean;
	lastActivation: number;
	desiredY: number;
}

let canvas: HTMLCanvasElement;
let imageData: ImageData;
let pong: Pong;
let statics: Statics;
let ai: AI;

function drawRectange(pos: Vec2, size: Vec2, colour: Colour): void {
	const data = imageData.data;
	let max: Vec2 = { x: Math.floor(pos.x + size.x), y: Math.floor(pos.y + size.y) };

	for (let y = Math.floor(pos.y); y < max.y; y++) {
		for (let x = Math.floor(pos.x); x < max.x; x++) {
			const index = (y * canvas.width + x) * 4;
			data[index] = colour.r;
			data[index + 1] = colour.g;
			data[index + 2] = colour.b;
			data[index + 3] = colour.a;
		}
	}
}

function rgbToString(colour: Colour): string {
	let str: string = "rgb(" + colour.r + ", " + colour.g + ", " + colour.b + ", " + (colour.a / 255) + ")";

	return str;
}

function drawThing(ctx: CanvasRenderingContext2D, thing: Paddle): void {
	ctx.fillStyle = rgbToString(thing.colour);
	ctx.fillRect(thing.pos.x, thing.pos.y, thing.size.x, thing.size.y);
}

function render(): void {
	const ctx = canvas.getContext("2d");

	if (ctx) {
		ctx.fillStyle = "rgb(200, 200, 200)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		drawThing(ctx, pong.player1);
		drawThing(ctx, pong.player2);
		if (pong.ball.img.complete) {
			ctx.drawImage(pong.ball.img, pong.ball.pos.x, pong.ball.pos.y);
		}
	}
}

function renderText(): void {
	const element = document.getElementById("myText");
	if (element) {
		element.innerHTML = "Controls:<br>";
		if (pong.isPaused == true)
			element.innerHTML += "P: unpause<br>";
		else
			element.innerHTML += "P: pause<br>";
		element.innerHTML += "R: reset<br>";
		if (ai.enabled)
			element.innerHTML += "T: disable AI<br>";
		else
			element.innerHTML += "T: enable AI<br>";
		element.innerHTML += "____________<br><br>Score: " + pong.score1 + ":" + pong.score2;
	}
}

// +--------------------------------------------------------------------------+
// |                             ^^^ RENDER ^^^                               |
// +--------------------------------------------------------------------------+

let pressedKeys = new Set<string>();

export function handleKeyDown(event: KeyboardEvent): void {
	pressedKeys.add(event.key);
	if (pressedKeys.has('t'))
		ai.enabled = !ai.enabled;
	if (pressedKeys.has('p'))
		pong.isPaused = !pong.isPaused;
	if (pressedKeys.has('r'))
		resetGame();
}

export function handleKeyUp(event: KeyboardEvent): void {
	pressedKeys.delete(event.key);
}

function handleinput(): void {
	if (pressedKeys.has('w'))
		pong.player1.dir.y -= 1;
	if (pressedKeys.has('s'))
		pong.player1.dir.y += 1;
	if (ai.enabled) {
		if (pong.player2.pos.y + pong.player2.size.y / 2 < ai.desiredY - pong.player2.size.y / 3)
			pong.player2.dir.y += 1;
		else if (pong.player2.pos.y + pong.player2.size.y / 2 > ai.desiredY - pong.player2.size.y / 3)
			pong.player2.dir.y -= 1;
	}
	else {
		if (pressedKeys.has('ArrowUp'))
			pong.player2.dir.y -= 1;
		if (pressedKeys.has('ArrowDown'))
			pong.player2.dir.y += 1;
	}
}

// +--------------------------------------------------------------------------+
// |                               ^^^ I/O ^^^                                |
// +--------------------------------------------------------------------------+

function simulateBall(): number {
	let ballPos: Vec2 = structuredClone(pong.ball.pos);
	let ballDir: Vec2 = structuredClone(pong.ball.dir);
	let ballSize: Vec2 = structuredClone(pong.ball.size);

	while (ballPos.x + ballSize.x < pong.player2.pos.x) {
		ballPos.x += ballDir.x;
		ballPos.y += ballDir.y;
		if (ballPos.x < pong.player1.pos.x + pong.player1.size.x) {
			ballPos.x = pong.player1.pos.x + pong.player1.size.x
			ballDir.x *= statics.ballBounce.x;
		}
		if (ballPos.y < 0) {
			ballPos.y = 0;
			ballDir.y *= statics.ballBounce.y;
		}
		else if (ballPos.y > canvas.height - ballSize.y) {
			ballPos.y = canvas.height - ballSize.y;
			ballDir.y *= statics.ballBounce.y;
		}
	}
	console.log("desired pos: ", ballPos.y + ballSize.y / 2);
	return ballPos.y + ballSize.y / 2;
}

function manageAI(): void {
	if (ai.enabled === false)
		return;
	const now = Math.floor(performance.now() / 1000);

	if (now === ai.lastActivation)
		return;
	ai.desiredY = simulateBall();
	ai.lastActivation = now;
}

// +--------------------------------------------------------------------------+
// |                                ^^^ AI ^^^                                |
// +--------------------------------------------------------------------------+


function generateBall(): void {
	let sizes: Array<number> = [12, 20, 40];
	let colours: Array<Colour> = [{ r: 0, g: 200, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }, { r: 225, g: 255, b: 0, a: 255 }];
	let rand: number = Math.floor(Math.random() * (pong.ball.arraySize));

	pong.ball.img = pong.ball.imgArray[rand];
	pong.ball.size = pong.ball.sizeArray[rand];
	pong.ball.pos = { x: (canvas.width - pong.ball.size.x) / 2, y: (canvas.height - pong.ball.size.y) / 2 };
	pong.ball.dir = { x: 2, y: 2 };

	rand = Math.floor(Math.random() * 4);
	if (rand & 1) {
		pong.ball.dir.x *= -1;
	}
	if (rand & 2) {
		pong.ball.dir.y *= -1;
	}
}

export function resetGame(): void {
	const offset: number = 20;
	const batsizeY: number = 100;

	pong.player1 = { pos: { x: offset * 2, y: (canvas.height - batsizeY) / 2 }, size: { x: offset, y: batsizeY }, dir: { x: 0, y: 0 }, colour: { r: 0, g: 0, b: 255, a: 255 } };
	pong.player2 = { pos: { x: canvas.width - offset * 3, y: (canvas.height - batsizeY) / 2 }, size: { x: offset, y: batsizeY }, dir: { x: 0, y: 0 }, colour: { r: 255, g: 0, b: 0, a: 255 } };
	pong.score1 = 0;
	pong.score2 = 0;
	pong.isPaused = false;
	generateBall();
}

function collision(): void {
	// top wall
	if (pong.ball.pos.y < 0) {
		pong.ball.pos.y = 0;
		pong.ball.dir.y *= statics.ballBounce.y;
	}
	// bottom wall
	else if (pong.ball.pos.y + pong.ball.size.y > canvas.height) {
		pong.ball.pos.y = canvas.height - pong.ball.size.y;
		pong.ball.dir.y *= statics.ballBounce.y;
	}
	// left player
	else if (pong.ball.pos.x <= pong.player1.pos.x + pong.player1.size.x &&
		pong.ball.previousPos.x > pong.player1.pos.x + pong.player1.size.x &&
		pong.ball.pos.y > pong.player1.pos.y - pong.ball.size.y &&
		pong.ball.pos.y < pong.player1.pos.y + pong.player1.size.y) {
		pong.ball.pos.x = pong.player1.pos.x + pong.player1.size.x;
		pong.ball.dir.x *= statics.ballBounce.x;
		pong.ball.dir.y += pong.player1.dir.y * 0.5;
	}
	// right player
	else if (pong.ball.pos.x + pong.ball.size.x >= pong.player2.pos.x &&
		pong.ball.previousPos.x + pong.ball.size.x < pong.player2.pos.x &&
		pong.ball.pos.y > pong.player2.pos.y - pong.ball.size.y &&
		pong.ball.pos.y < pong.player2.pos.y + pong.player2.size.y) {
		pong.ball.pos.x = pong.player2.pos.x - pong.ball.size.x;
		pong.ball.dir.x *= statics.ballBounce.x;
		pong.ball.dir.y += pong.player2.dir.y * 0.5;
	}
	// left/right wall
	else if (pong.ball.pos.x < 0 || pong.ball.pos.x + pong.ball.size.x > canvas.width) {
		if (pong.ball.pos.x < 0)
			pong.score2++;
		else
			pong.score1++;
		if (pong.score1 >= 5 || pong.score2 >= 5)
			resetGame();
		generateBall();
	}
}

function managePaddle(paddle: Paddle): void {
	let friction: number = 0.9;

	paddle.dir.y *= friction
	paddle.pos.y += paddle.dir.y;
	if (paddle.pos.y < 0) {
		paddle.pos.y = 0;
		paddle.dir.y = 0;
	}
	if (paddle.pos.y > canvas.height - paddle.size.y) {
		paddle.pos.y = canvas.height - paddle.size.y;
		paddle.dir.y = 0;
	}
}

function logic(): void {
	managePaddle(pong.player1);
	managePaddle(pong.player2);
	pong.ball.pos.x += pong.ball.dir.x;
	pong.ball.pos.y += pong.ball.dir.y;
	collision();
	pong.ball.previousPos = { x: pong.ball.pos.x, y: pong.ball.pos.y };
}

export function loop(): void {
	handleinput();
	if (pong.isPaused == false) {
		manageAI();
		logic();
		render();
	}
	renderText();
	requestAnimationFrame(loop);
}

// +--------------------------------------------------------------------------+
// |                              ^^^ Logic ^^^                               |
// +--------------------------------------------------------------------------+
// |                              vvv Init. vvv                               |
// +--------------------------------------------------------------------------+

function addBall(path: string, size: Vec2): void {
	let img = new Image();

	img.src = path;
	pong.ball.imgArray.push(img);
	pong.ball.sizeArray.push(size);
	pong.ball.arraySize++;
}

function initBalls(): void {
	pong.ball =
	{
		pos: { x: 0, y: 0 },
		previousPos: { x: 0, y: 0 },
		size: { x: 0, y: 0 },
		dir: { x: 0, y: 0 },
		img: new Image(),

		sizeArray: [],
		imgArray: [],
		arraySize: 0
	};

	addBall("ball.png", { x: 40, y: 40 });
	addBall("tennisball.png", { x: 20, y: 20 });

	generateBall();
}

function initPong(): void {
	pong = {
		player1: {
			pos: { x: 0, y: 0 },
			size: { x: 0, y: 0 },
			dir: { x: 0, y: 0 },
			colour: { r: 0, g: 0, b: 0, a: 0 }
		},
		player2: {
			pos: { x: 0, y: 0 },
			size: { x: 0, y: 0 },
			dir: { x: 0, y: 0 },
			colour: { r: 0, g: 0, b: 0, a: 0 }
		},
		ball: {
			pos: { x: 0, y: 0 },
			previousPos: { x: 0, y: 0 },
			size: { x: 0, y: 0 },
			dir: { x: 0, y: 0 },
			img: new Image(),
			sizeArray: [],
			imgArray: [],
			arraySize: 0
		},
		score1: 0,
		score2: 0,
		isPaused: false
	};

	statics = {
		ballBounce: { x: -1.15, y: -0.9 },
	}

	ai = {
		enabled: false,
		lastActivation: 0,
		desiredY: 0,
	}
}

export default function initWindow(sizeX: number, sizeY: number): void {
	canvas = document.createElement("canvas");
	canvas.width = sizeX;
	canvas.height = sizeY;
	document.body.appendChild(canvas);  // Append the canvas to the document body

	// Get the drawing context
	const ctx = canvas.getContext("2d");

	if (ctx) {
		initPong();
		initBalls();
		// Create an ImageData object
		imageData = ctx.createImageData(canvas.width, canvas.height);
		// Start the game loop (rendering every frame)
		requestAnimationFrame(loop);
	}
}

// Init function
window.onload = () => {
	initWindow(800, 600);
	resetGame();
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
};

(window as any).initWindow = initWindow;
(window as any).loop = loop;
