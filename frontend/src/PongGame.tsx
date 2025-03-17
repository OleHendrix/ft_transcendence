import { useState, useEffect } from "react";

function PongGame()
{
	const [p2Position, setP2Position] = useState(50);
	const [p1Position, setP1Position] = useState(50);

	const [ballY, setBallY] = useState(50);
	const [ballX, setBallX] = useState(50);

	const [ballDirectionX, setBallDirectionX] = useState(1); 
	const [ballDirectionY, setBallDirectionY] = useState(1); 
	const [ballSpeed, setBallSpeed] = useState(0.5);

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
			const p1Dir = keysPressed['w'] && keysPressed['s'] ? 0 : (keysPressed['w'] ? -1 : 0) + (keysPressed['s'] ? 1 : 0);
			const p2Dir = keysPressed['ArrowUp'] && keysPressed['ArrowDown'] ? 0 : (keysPressed['ArrowUp'] ? -1 : 0) + (keysPressed['ArrowDown'] ? 1 : 0);

			if (p1Dir !== 0)
				setP1Position(prev => Math.max(10, Math.min(90, prev + p1Dir)));
			if (p2Dir !== 0)
				setP2Position(prev => Math.max(10, Math.min(90, prev + p2Dir)));

			setBallX(prev => prev + ballSpeed * ballDirectionX);
  			setBallY(prev => prev + ballSpeed * ballDirectionY);

			if (ballY <= 1 || ballY >= 99)
			{
				setBallY(ballY <= 1 ? 2 : 98);
    			setBallDirectionY(prev => -prev);
			}
			if (ballX <= 4 && ballY >= p1Position - 10 && ballY <= p1Position + 10)
				setBallDirectionX(1);

			if (ballX >= 96 && ballY >= p2Position - 10 && ballY <= p2Position + 10)
				setBallDirectionX(-1);

			animationId = requestAnimationFrame(moveFrame);
		};
		let animationId = requestAnimationFrame(moveFrame);
		return () => { cancelAnimationFrame(animationId); };
	}, [keysPressed, ballX, ballY, ballDirectionX, ballDirectionY, ballSpeed, p1Position, p2Position]);


	return(
	<div className="w-screen h-screen box-border overflow-hidden relative m-0">
		<div className="score">
			<div className="score_p1"></div>
			<div className="score_p2"></div>
		</div>
		<div className="ball absolute bg-white w-[2vh] h-[2vh] rounded-full" style={{ top: `${ballY}vh`, left: `${ballX}vw`, transform: 'translateY(-50%) translateX(-50%)' }}></div>
		<div className="p1 absolute left-[4vh] bg-white w-[2vh] h-[20vh]" style={{ top: `${p1Position}vh`, transform: 'translateY(-50%)' }}></div>
		<div className="p2 absolute right-[4vh] bg-white w-[2vh] h-[20vh]" style={{ top: `${p2Position}vh`, transform: 'translateY(-50%)' }}></div>
	</div>
	)
}

export default PongGame