import { useState, useEffect } from 'react'
// // import Pong from './types'
// // import AI from './types'
// // import Statics from './types'
// import loop from './ponggame_1'
// import resetGame from './ponggame_1'
// import handleKeyDown from './ponggame_1'
// import handleKeyUp from './ponggame_1'
// import initWindow from './ponggame_1'
// // import { Pong, Statics, AI } from './types'
import initWindow, { loop, handleKeyDown, handleKeyUp } from "./ponggame_1"; // Import je Pong-code

const PongGame: React.FC = () => {
    useEffect(() => {
		(window as any).initWindow = initWindow;
		(window as any).loop = loop;
        initWindow(800, 600); // Start het spel als de component mount
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return <></>; // De canvas wordt automatisch aan de body toegevoegd door initWindow()
};

export default PongGame