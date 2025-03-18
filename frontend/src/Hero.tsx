import { Dispatch, SetStateAction } from "react";
import { RiGamepadLine } from "react-icons/ri";
import { TbTournament } from "react-icons/tb";
import { PlayerType } from "./types"
import Players from "./Players";
import "./ponganimation.css";

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

function Hero({ players, setPlayerCount, loggedInPlayers, setLoggedInPlayers }: { players: PlayerType[]; setPlayerCount: (value: number) => void; loggedInPlayers: PlayerType[]; setLoggedInPlayers: Dispatch<SetStateAction<PlayerType[]>> })
{
	return(
		<div className="w-full flex justify-between items-start pt-[10vh]">
			<div className="w-1/2 flex h-[calc(100vh - 8vh)] justify-start flex-col p-24 space-y-12 px-[6vw]">
				<h1 className="text-6xl  font-semibold text-brand-orange">Are you ready for a <span className="font-black italic text-[#ff914d]">transcending</span> game of Pong?</h1>
				<p className="text-2xl">Get ready for the ultimate Pong experience. Challenge your friends in fast-paced, competitive matches where every point matters. Are you ready to outplay, outlast, and outscore?</p>
				<div className="flex justify-start space-x-4 font-bold text-lg">
					<button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white py-2 px-4 rounded-3xl ${loggedInPlayers.length !== 2 ? 'opacity-40' : 'hover:bg-[#246bcb] hover:cursor-pointer'}`}>
						<p>Play</p>
						<RiGamepadLine />
					</button>
					<button className={`flex items-center h-10 space-x-2 bg-[#ff914d] text-white py-2 px-4 rounded-3xl ${loggedInPlayers.length < 3 ? 'opacity-40' : 'hover:bg-[#ab5a28] hover:cursor-pointer'}`}>
						<p>Tournament</p>
						<TbTournament />
					</button>
				</div>
					<Players players={players} setPlayerCount={setPlayerCount} loggedInPlayers={loggedInPlayers} setLoggedInPlayers={setLoggedInPlayers}/>
			</div>
			<div className="w-1/2 h-[calc(100vh - 8vh)] flex justify-start flex-col p-24 space-y-8 max-w-[50vw] px-[6vw]">
				<SimplePong />
			</div>
		</div>
	)
}

export default Hero