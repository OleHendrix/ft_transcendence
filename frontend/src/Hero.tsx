import { motion, AnimatePresence } from 'framer-motion';
import { RiGamepadLine } from "react-icons/ri";
import { TbTournament } from "react-icons/tb";
import { usePlayerContext } from "./contexts/PlayerContext";
import Players from "./Players";
import "./css/ponganimation.css";

function SimplePong()
{
	return (
		<div className="pong-wrapper w-full max-w-[40vw] aspect-[4/3]">
			<div className="pong-game">
				<div className="paddle left-paddle"></div>
				<div className="ball"></div>
				<div className="paddle right-paddle"></div>
			</div>
		</div>
	)
}

function AddGame()
{
	
}

function Hero()
{
	const { loggedInPlayers, setIsPlaying } = usePlayerContext();

	return(
		<div className="w-full flex justify-between items-start pt-[10vh]">
			<div className="w-1/2 flex h-[calc(100vh - 8vh)] justify-start flex-col p-24 pr-16 space-y-12 px-[6vw]">
				<h1 className="text-6xl  font-semibold text-brand-orange">Are you ready for a <span className="font-black italic text-[#ff914d]">transcending</span> game of Pong?</h1>
				<p className="text-2xl">Get ready for the ultimate Pong experience. Challenge your friends in fast-paced, competitive matches where every point matters. Are you ready to outplay, outlast, and outscore?</p>
				<div className="flex justify-start space-x-4 font-bold text-lg">
					<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white py-2 px-4 rounded-3xl
						${loggedInPlayers.length !== 2 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`} 
						whileHover={(loggedInPlayers.length === 2 ? {scale: 1.03} : {})} 
						whileTap={(loggedInPlayers.length === 2 ? {scale: 0.97} : {})}
						onClick={() => setIsPlaying(true)}>
						<p>Play</p>
						<RiGamepadLine />
					</motion.button>
					<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white py-2 px-4 rounded-3xl
						${loggedInPlayers.length !== 1 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`} 
						whileHover={(loggedInPlayers.length === 1 ? {scale: 1.03} : {})} 
						whileTap={(loggedInPlayers.length === 1 ? {scale: 0.97} : {})}
						onClick={() => setIsPlaying(true)}>
						<p>Play vs AI</p>
						<RiGamepadLine />
					</motion.button>
					<motion.button className={`flex items-center h-10 space-x-2 bg-[#ff914d] text-white py-2 px-4 rounded-3xl
						${loggedInPlayers.length < 3 ? 'opacity-40' : 'hover:bg-[#ab5a28] hover:cursor-pointer'}`}
						whileHover={(loggedInPlayers.length > 2 ? {scale: 1.03} : {})}
						whileTap={(loggedInPlayers.length > 2 ? {scale: 0.97} : {})}>
						<p>Tournament</p>
						<TbTournament />
					</motion.button>
				</div>
					<Players />
			</div>
			<div className="w-1/2 h-[calc(100vh - 8vh)] flex justify-start flex-col p-24 pl-16 space-y-12 max-w-[50vw] px-[6vw]">
				<SimplePong />
			</div>
		</div>
	)
}

export default Hero