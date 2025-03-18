import { useState, useEffect } from "react";

function PongGame()
{
	const [p1Y, setP1Y] = useState(50);
	const [p2Y, setP2Y] = useState(50);

	const [ballY, setBallY] = useState(50);
	const [ballX, setBallX] = useState(50);
	const [ballDirX, setBallDirX] = useState(1); 
	const [ballDirY, setBallDirY] = useState(0);
	const [ballSpeed, setBallSpeed] = useState(0.5);

	const [p1Score, setP1Score] = useState(0);
	const [p2Score, setP2Score] = useState(0);

	const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

  	useEffect(() =>
	{
		const handleKeyDown = (e: KeyboardEvent) => {setKeysPressed(prev => ({ ...prev, [e.key]: true }));};
		const handleKeyUp = (e: KeyboardEvent) => {setKeysPressed(prev => ({ ...prev, [e.key]: false }));};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	
		return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
	}, []);

	useEffect(() =>
	{
		const moveFrame = () =>
		{
			const p1DirY = keysPressed['w'] && keysPressed['s'] ? 0 : (keysPressed['w'] ? -1 : 0) + (keysPressed['s'] ? 1 : 0);
			const p2DirY = keysPressed['ArrowUp'] && keysPressed['ArrowDown'] ? 0 : (keysPressed['ArrowUp'] ? -1 : 0) + (keysPressed['ArrowDown'] ? 1 : 0);

			if (p1DirY !== 0)
				setP1Y(prev => Math.max(10, Math.min(90, prev + p1DirY)));
			if (p2DirY !== 0)
				setP2Y(prev => Math.max(10, Math.min(90, prev + p2DirY)));

			setBallX(prev => prev + ballSpeed * ballDirX);
  			setBallY(prev => prev + ballSpeed * ballDirY);

			if (ballY <= 1 || ballY >= 99)
			{
				setBallY(ballY <= 1 ? 2 : 98);
    			setBallDirY(prev => -prev);
			}

			if (ballX <= 5 && ballY >= p1Y - 10 && ballY <= p1Y + 10)
				setBallDirX(1);
			if (ballX >= 95 && ballY >= p2Y - 10 && ballY <= p2Y + 10)
				setBallDirX(-1);

			if (ballX <= 0)
			{
				setP2Score(prev => prev + 1);
				resetBall();
			}
			if (ballX >= 100)
			{
				setP1Score(prev => prev + 1);
				resetBall();
			}

			function resetBall() {setBallY(50); setBallX(50); setBallDirY(1); setBallDirX(1);}
			animationId = requestAnimationFrame(moveFrame);
		};
		let animationId = requestAnimationFrame(moveFrame);
		return () => { cancelAnimationFrame(animationId); };
	}, [keysPressed, ballX, ballY, ballDirX, ballDirY, ballSpeed, p1Y, p2Y]);


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
		<div className={`absolute ${ballDirX > 0 ? 'bg-[#ff914d]' : 'bg-[#134588]'} w-[2vw] h-[2vw] rounded-full`} style={{ top: `${ballY}vh`, left: `${ballX}vw`, transform: 'translateY(-50%) translateX(-50%)' }}></div>
		<div className="absolute left-[2vw] bg-[#ff914d] w-[2vw] h-[20vh]" style={{ top: `${p1Y}vh`, transform: 'translateY(-50%)', boxShadow: "0 0 15px rgba(255, 145, 77, 0.6)" }}></div>
		<div className="absolute right-[2vw] bg-[#134588] w-[2vw] h-[20vh]" style={{ top: `${p2Y}vh`, transform: 'translateY(-50%)', boxShadow: "0 0 15px rgba(19, 69, 136, 0.6)" }}></div>
	</div>
	)
}

export default PongGame