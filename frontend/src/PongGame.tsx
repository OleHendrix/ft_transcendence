import { useState, useEffect } from "react";

interface Vec2 {
	x: number;
	y: number;
}

interface Paddle {
	pos: Vec2;
	size: Vec2;
	dir: Vec2;
}

interface Ball {
	pos:		Vec2;
	prevPos:	Vec2;
	size:		Vec2;
	dir:		Vec2;
}

interface AI {
	enabled:		boolean;
	lastActivation:	number;
	desiredY:		number;
}

interface Statics {
	BOUNCE:		Vec2;
	CARRYOVER:	number,
	VELOCITY:	number,
	FRICTION:	number,
}

function PongGame()
{
	const [p1Y, setP1Y] = useState(50);
	const [p2Y, setP2Y] = useState(50);
	const [p1DirY, setP1DirY] = useState(0);
	const [p2DirY, setP2DirY] = useState(0);

	const [ball, setBall] = useState<Ball>({
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

	function resetBall() {
		setBall({
			pos:		{ x: 50,  y: 50  },
			prevPos:	{ x: 50,  y: 50  },
			size:		{ x: 2,   y: 2   },
			dir:		{ x: 0.5, y: 0.5 },
		});
	}

	function handleColision()
	{
		if (ball.pos.y <= 1 || ball.pos.y >= 99)
		{
			setBall(prev => ({ ...prev,
				pos: { ...prev.pos, y: prev.pos.y <= 1 ? 2 : 98 },
				dir: { ...prev.dir, y: prev.dir.y * s.BOUNCE.y },
			}));
		}

		if (ball.pos.x < 5 && ball.prevPos.x >= 5 && ball.pos.y >= p1Y - 10 && ball.pos.y <= p1Y + 10)
		{
			setBall(prev => ({ ...prev,
				pos: { ...prev.pos, x: 5 },
				dir: { x: prev.dir.x * s.BOUNCE.x, y: prev.dir.y + p1DirY * s.CARRYOVER },
			}));
		}
		if (ball.pos.x > 95 && ball.prevPos.x <= 95 && ball.pos.y >= p2Y - 10 && ball.pos.y <= p2Y + 10)
		{
			setBall(prev => ({ ...prev,
				pos: { ...prev.pos, x: 95 },
				dir: { x: prev.dir.x * s.BOUNCE.x, y: prev.dir.y + p2DirY * s.CARRYOVER },
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
				// ballCopy.dir.y += p1DirY * 0.5;
			}
			ballCopy.pos.x += ballCopy.dir.x;
			ballCopy.pos.y += ballCopy.dir.y;
		}
		ai.desiredY = ballCopy.pos.y;
	}

	function managePaddle(dirY: number, setPosY: React.Dispatch<React.SetStateAction<number>>, setDirY: React.Dispatch<React.SetStateAction<number>>) {
		const offset: number = 10;
		setPosY(prevPosY => {
			if (prevPosY < offset || prevPosY > 100 - offset) {
				setDirY(0);
				return Math.max(offset, Math.min(100 - offset, prevPosY + dirY));
			}
			return prevPosY + dirY;
		});
	}

	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

	useEffect(() =>
	{
		const handleKeyDown = (e: KeyboardEvent) => {
			setKeysPressed(prev => ({ ...prev, [e.key]: true }));
			if (e.key === "t" || e.key === "T") {
				setAI(prevAI => ({ ...prevAI, enabled: !prevAI.enabled }));
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
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
			setP1DirY(P1DirY => s.FRICTION * P1DirY + s.VELOCITY * (keysPressed['w'] && keysPressed['s'] ? 0 : (keysPressed['w'] ? -1 : 0) + (keysPressed['s'] ? 1 : 0)));
			if (ai.enabled === false)
				setP2DirY(P2DirY => s.FRICTION * P2DirY + s.VELOCITY * (keysPressed['ArrowUp'] && keysPressed['ArrowDown'] ? 0 : (keysPressed['ArrowUp'] ? -1 : 0) + (keysPressed['ArrowDown'] ? 1 : 0)));
			else
				setP2DirY(P2DirY => s.FRICTION * P2DirY + s.VELOCITY * ((p2Y + 8 < ai.desiredY) ? 1 : (p2Y - 8 > ai.desiredY) ? -1 : 0));
			managePaddle(p1DirY, setP1Y, setP1DirY);
			managePaddle(p2DirY, setP2Y, setP2DirY);

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
	}, [keysPressed, ball.pos.x, ball.pos.y, ball.dir.x, ball.dir.y, p1Y, p2Y]);


	return(
	<div className="w-screen h-screen box-border overflow-hidden relative m-0">
		<div className="absolute inset-0 text-[75vh] flex justify-center items-center font-black">
			<div className="h-full w-1/2 flex justify-center items-center">
				<h1 className="text-[#ff914d] opacity-5">{p1Score}</h1>
			</div>
			<div className="h-full w-1/2 flex justify-center items-center">
				<h1 className="text-[#134588] opacity-10">{p2Score}</h1>
			</div>
		</div>
		<div className={`absolute ${ball.dir.x > 0 ? 'bg-[#ff914d]' : 'bg-[#134588]'} w-[2vw] h-[2vw] rounded-full`} style={{ top: `${ball.pos.y}vh`, left: `${ball.pos.x}vw`, transform: 'translateY(-50%) translateX(-50%)' }}></div>
		<div className="absolute left-[2vw] bg-[#ff914d] w-[2vw] h-[20vh]" style={{ top: `${p1Y}vh`, transform: 'translateY(-50%)', boxShadow: "0 0 15px rgba(255, 145, 77, 0.6)" }}></div>
		<div className="absolute right-[2vw] bg-[#134588] w-[2vw] h-[20vh]" style={{ top: `${p2Y}vh`, transform: 'translateY(-50%)', boxShadow: "0 0 15px rgba(19, 69, 136, 0.6)" }}></div>
	</div>
	)
}

export default PongGame