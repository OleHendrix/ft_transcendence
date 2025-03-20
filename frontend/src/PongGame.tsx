import { useState, useEffect } from "react";
import { Ball, AI, Statics, Paddle } from "./types"; 

function PongGame()
{
	const [p1, setP1] = useState<Paddle>
	({ 
		pos: { x: 4, y: 50},  size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#ff914d"
	});
	const [p2, setP2] = useState<Paddle>
	({ 
		pos: { x: 96, y: 50},  size: { x: 2, y: 20 }, dir: { x: 0, y: 0 }, colour: "#134588"
	});

	const [ball, setBall] = useState<Ball>
	({
		pos:		{ x: 50,  y: 50  },
		prevPos:	{ x: 50,  y: 50  },
		size:		{ x: 2,   y: 2   },
		dir:		{ x: 0.5, y: 0.5 },
	});

	const [ai, setAI] = useState<AI>({
		enabled: false,
		lastActivation: 0,
		desiredY: 50
	});

	const [s] = useState<Statics>({
		BOUNCE:		{ x: -1.02, y: -0.9 },
		CARRYOVER:	0.5,
		VELOCITY:	0.3,
		FRICTION:	0.9,
	});

	const [p1Score, setP1Score] = useState(0);
	const [p2Score, setP2Score] = useState(0);

	function resetBall()
	{
		let rand: number = Math.random();

		setBall({
			pos:		{ x: 50,  y: 50  },
			prevPos:	{ x: 50,  y: 50  },
			size:		{ x: 2,   y: 2   },
			dir:		{ x: 0.5, y: 0.5 },
		});
	}

	// function resetBall()
	// {
	// 	const rand: number = Math.random();
	// 	const pos: number = rand < 0.5 ? 20 : 80;

	// 	setBall({
	// 		pos:		{ x: pos,	y: 50  },
	// 		prevPos:	{ x: pos,	y: 50  },
	// 		size:		{ x: 2,		y: 2   },
	// 		dir:		{ x: 0.5,	y: 0.5 },
	// 	});
	// }

	// function paddleColision(paddle: Paddle, setPaddle: React.Dispatch<React.SetStateAction<Paddle>>)
	// {
	// 	let temp: Vec2 = structuredClone(ball.pos);

	// 	if (temp.x < paddle.pos.x)
	// 		temp.x = paddle.pos.x;
	// 	else if (temp.x > paddle.pos.x + paddle.size.x)




	// 	boolean circleRect(float cx, float cy, float radius, float rx, float ry, float rw, float rh) {

	// 		// temporary variables to set edges for testing
	// 		float testX = cx;
	// 		float testY = cy;
		  
	// 		// which edge is closest?
	// 		if (cx < rx)         testX = rx;      // test left edge
	// 		else if (cx > rx+rw) testX = rx+rw;   // right edge
	// 		if (cy < ry)         testY = ry;      // top edge
	// 		else if (cy > ry+rh) testY = ry+rh;   // bottom edge
		  
	// 		// get distance from closest edges
	// 		float distX = cx-testX;
	// 		float distY = cy-testY;
	// 		float distance = sqrt( (distX*distX) + (distY*distY) );
		  
	// 		// if the distance is less than the radius, collision!
	// 		if (distance <= radius) {
	// 		  return true;
	// 		}
	// 		return false;
	// 	}
	// }

	function handleColision()
	{
		if (ball.pos.y < 2 || ball.pos.y > 98)
		{
			setBall(prev => ({ ...prev,
				pos: { ...prev.pos, y: prev.pos.y <= 5 ? 2 : 98 },
				dir: { ...prev.dir, y: prev.dir.y * s.BOUNCE.y },
			}));
		}

		if (ball.pos.x < 5 && ball.prevPos.x >= 5 && ball.pos.y >= p1.pos.y - 10 - ball.size.y / 2 && ball.pos.y <= p1.pos.y + 10 + ball.size.y / 2)
		{
			setBall(prev => ({ ...prev,
				pos: { ...prev.pos, x: 5 },
				dir: { x: prev.dir.x * s.BOUNCE.x, y: prev.dir.y + p1.dir.y * s.CARRYOVER },
			}));
		}
		if (ball.pos.x > 95 && ball.prevPos.x <= 95 && ball.pos.y >= p2.pos.y - 10 - ball.size.y / 2 && ball.pos.y <= p2.pos.y + 10 + ball.size.y / 2)
		{
			setBall(prev => ({ ...prev,
				pos: { ...prev.pos, x: 95 },
				dir: { x: prev.dir.x * s.BOUNCE.x, y: prev.dir.y + p2.dir.y * s.CARRYOVER },
			}));
		}

		if (ball.pos.x <= 0)
		{
			setP2Score(prev => prev + 1);
			resetBall();
		}
		if (ball.pos.x >= 100)
		{
			setP1Score(prev => prev + 1);
			resetBall();
		}
	}

	function manageAI()
	{
		if (!ai.enabled)
			return;
		const timeSeconds = Math.floor(Date.now() / 1000);

		if (ai.lastActivation === timeSeconds)
			return;
		ai.lastActivation = timeSeconds;
		const ballCopy = structuredClone(ball);
		while (ballCopy.pos.x < 95)
		{
			if (ballCopy.pos.y <= 1 || ballCopy.pos.y >= 99)
			{
				ballCopy.pos.y = ballCopy.pos.y <= 1 ? 2 : 98;
				ballCopy.dir.y *= s.BOUNCE.y;
			}
			if (ballCopy.pos.x < 5)
			{
				ballCopy.pos.x = 5;
				ballCopy.dir.x *= s.BOUNCE.x;
				// ballCopy.dir.y += p1.dir.y * 0.5;
			}
			ballCopy.pos.x += ballCopy.dir.x;
			ballCopy.pos.y += ballCopy.dir.y;
		}
		ai.desiredY = ballCopy.pos.y;
	}

	function managePaddle(paddle: Paddle, dirY: number, setPaddle: React.Dispatch<React.SetStateAction<Paddle>>)
	{
		const halfSize = paddle.size.y / 2;

		setPaddle(prev => ({ ...prev,
			pos: { ...prev.pos, y: prev.pos.y + prev.dir.y },
			dir: { ...prev.dir, y: s.FRICTION * prev.dir.y + s.VELOCITY * dirY  }
		}));
		if (paddle.pos.y < halfSize || paddle.pos.y > 100 - halfSize)
		{
			setPaddle(prev => ({ ...prev,
				pos: { ...prev.pos, y: (prev.pos.y < 50) ? halfSize : 100 - halfSize },
				dir: { ...prev.dir, y: 0 },
			}));
		}
	}

	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

	useEffect(() =>
	{
		const handleKeyDown = (e: KeyboardEvent) =>
		{
			setKeysPressed(prev => ({ ...prev, [e.key]: true }));
			if (e.key === "t" || e.key === "T")
				setAI(prevAI => ({ ...prevAI, enabled: !prevAI.enabled }));
		};

		const handleKeyUp = (e: KeyboardEvent) =>
		{
			setKeysPressed(prev => ({ ...prev, [e.key]: false }));
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	
		return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
	}, []);

	useEffect(() =>
	{
		const moveFrame = () =>
		{
			let P1DirY: number = 0;
			let P2DirY: number = 0;

			P1DirY = keysPressed['w'] && keysPressed['s'] ? 0 : (keysPressed['w'] ? -1 : 0) + (keysPressed['s'] ? 1 : 0);
			if (ai.enabled === false)
				P2DirY = keysPressed['ArrowUp'] && keysPressed['ArrowDown'] ? 0 : (keysPressed['ArrowUp'] ? -1 : 0) + (keysPressed['ArrowDown'] ? 1 : 0);
			else
				P2DirY = (p2.pos.y + 8 < ai.desiredY) ? 1 : (p2.pos.y - 8 > ai.desiredY) ? -1 : 0;
			
			managePaddle(p1, P1DirY, setP1);
			managePaddle(p2, P2DirY, setP2);

			setBall(prev => ({ ...prev,
				prevPos: { x: prev.pos.x,              y: prev.pos.y },
				pos:     { x: prev.pos.x + prev.dir.x, y: prev.pos.y + prev.dir.y },
			}));

			manageAI();
			handleColision();
			animationId = requestAnimationFrame(moveFrame);
		};
		let animationId = requestAnimationFrame(moveFrame);
		return () => { cancelAnimationFrame(animationId); };
	}, [keysPressed, ball.pos.x, ball.pos.y, ball.dir.x, ball.dir.y, p1.pos.y, p2.pos.y]);

	return(
	<div className="w-screen h-[calc(100vh-8vh)] box-border overflow-hidden relative m-0">
		<div className="relative w-full h-full">
			<div className="absolute inset-0 text-[75%] flex justify-center items-center font-black">
				<div className="h-full w-1/2 flex justify-center items-center">
					<h1 className="text-[#ff914d] opacity-5">{p1Score}</h1>
				</div>
				<div className="h-full w-1/2 flex justify-center items-center">
					<h1 className="text-[#134588] opacity-10">{p2Score}</h1>
				</div>
			</div>

			<div className={`absolute  rounded-full`} style=
			{{
				backgroundColor: ball.dir.x > 0 ? p1.colour : p2.colour,
				width: `${ball.size.x}vw`,
				height: `${ball.size.y}vw`,
				top: `${ball.pos.y}%`,
				left: `${ball.pos.x}vw`,
				transform: 'translateY(-50%) translateX(-50%)'
			}}></div>
			<div className="absolute rounded-sm" style={{
				backgroundColor: p1.colour,
				width: `${p1.size.x}vw`,
				height: `${p1.size.y}%`,
				left: `${p1.pos.x - p1.size.x}vw`,
				top: `${p1.pos.y}%`,
				transform: 'translateY(-50%)',
				boxShadow: "0 0 15px rgba(255, 145, 77, 0.6)"
			}}></div>
			<div className="absolute rounded-sm" style={{
				backgroundColor: p2.colour,
				width: `${p2.size.x}vw`,
				height: `${p2.size.y}%`,
				left: `${p2.pos.x}vw`,
				top: `${p2.pos.y}%`,
				transform: 'translateY(-50%)',
				boxShadow: "0 0 15px rgba(19, 69, 136, 0.6)"
			}}></div>
		</div>
	</div>
	)
}

export default PongGame