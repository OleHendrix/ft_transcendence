import { useState, useEffect } from "react";

function PongGame()
{
  const [p2Position, setP2Position] = useState(50);
  const [p1Position, setP1Position] = useState(50);

  const [ballY, setBallY] = useState(50);
  const [ballX, setBallX] = useState(50);

  // Gebruik een object om alle ingedrukte toetsen bij te houden
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

  useEffect(() =>
  {
    const handleKeyDown = (e: KeyboardEvent) =>
    {
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
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
      // Voor paddle 1, beide toetsen = stil staan
      let p1Dir = 0;
      if (keysPressed['w'] && keysPressed['s']) 
      {
        // Als beide toetsen ingedrukt, sta stil (p1Dir blijft 0)
      } 
      else 
      {
        p1Dir = (keysPressed['w'] ? -1 : 0) + (keysPressed['s'] ? 1 : 0);
      }

      // Voor paddle 2, beide toetsen = stil staan
      let p2Dir = 0;
      if (keysPressed['ArrowUp'] && keysPressed['ArrowDown']) 
      {
        // Als beide toetsen ingedrukt, sta stil (p2Dir blijft 0)
      } 
      else 
      {
        p2Dir = (keysPressed['ArrowUp'] ? -1 : 0) + (keysPressed['ArrowDown'] ? 1 : 0);
      }

      // Update paddle 1 positie
      if (p1Dir !== 0)
        setP1Position(prev => 
        {
          const newPos = prev + p1Dir;
          if (newPos < 10) return 10;
          if (newPos > 90) return 90;
          return newPos;
        });

      // Update paddle 2 positie
      if (p2Dir !== 0)
        setP2Position(prev => 
        {
          const newPos = prev + p2Dir;
          if (newPos < 10) return 10;
          if (newPos > 90) return 90;
          return newPos;
        });

      animationId = requestAnimationFrame(moveFrame);
    };
    
    let animationId = requestAnimationFrame(moveFrame);
    
    return () => { cancelAnimationFrame(animationId); };
  }, [keysPressed]);


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