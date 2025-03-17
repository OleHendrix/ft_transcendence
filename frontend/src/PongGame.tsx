import { useState, useEffect } from "react";


function PongGame()
{
	const [p2Position, setP2Position] = useState(50);
	const [p1Position, setP1Position] = useState(50);

	const [ballY, setBallY] = useState(50);
	const [ballX, setBallX] = useState(50);

	const [p1Direction, setP1Direction] = useState(0);
	const [p2Direction, setP2Direction] = useState(0);

	useEffect(() =>
	{
		const handleKeyDown = (e: KeyboardEvent) =>
		{
			if (e.key === 'w')
				setP1Direction(-1);
			if (e.key === 's')
				setP1Direction(1);
			if (e.key === 'ArrowUp')
				setP2Direction(-1);
			if (e.key === 'ArrowDown')
				setP2Direction(1);
		};
	
		const handleKeyUp = (e: KeyboardEvent) =>
		{
			if (e.key === 'w' || e.key === 's')
				setP1Direction(0);
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
				setP2Direction(0);
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	
	return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
	}, []);

	useEffect(() =>
	{
		const moveFrame = () =>
		{
			if (p1Direction !== 0)
			setP1Position(prev => 
			{
				const newPos = prev + p1Direction;
				if (newPos < 10) return 10;
				if (newPos > 90) return 90;
				return newPos;
			});

			if (p2Direction !== 0)
			setP2Position(prev => 
			{
				const newPos = prev + p2Direction;
				if (newPos < 10) return 10;
				if (newPos > 90) return 90;
				return newPos;
			});

			animationId = requestAnimationFrame(moveFrame);
		};
		
		let animationId = requestAnimationFrame(moveFrame);
		
		return () => { cancelAnimationFrame(animationId); };
	}, [p1Direction, p2Direction]);

	return(
	<div className="w-screen h-screen box-border m-0">
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