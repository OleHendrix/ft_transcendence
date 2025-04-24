import React, { useEffect } from "react";
import { motion } from 'framer-motion';
import { useAccountContext } from "./contexts/AccountContext";
import { Link } from 'react-router-dom';
import Player from "../assets/Player.svg";
import P1 from "../assets/P1.png";
import P2 from "../assets/P2.png";
import PlayerAdd from "../assets/PlayerAdd.svg"
import { PlayerState } from "./types";

const Players = React.memo(function Players()
{
	const { isPlaying, loggedInAccounts, setTriggerFetchAccounts } = useAccountContext();

	return(
		<>
			<div className="flex items-center">
				{loggedInAccounts?.map((player, index) =>
				(
					<div key={index} className="flex items-center flex-col space-y-0.5 w-18">
						<Link to={`/playerinfo/${player.username}`}>
							<div className="relative">
							<motion.img src={player.avatar !== '' ? player.avatar : Player}
								className="h-12 w-auto hover:cursor-pointer rounded-full object-cover shadow-lg"
								whileHover={{scale: 1.07}}
								whileTap={{scale: 0.93}}
								onClick={() =>
								{
									if (isPlaying !== PlayerState.playing)
										setTriggerFetchAccounts(true);
								}}/>
							{player.avatar !== '' && <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black to-transparent opacity-70"></div>}
							{loggedInAccounts.length < 3 && <img src={index === 0 ? P1 : P2} className="h-5 w-auto absolute bottom-0 right-0" />}
							</div>
						</Link>
						<p className="text-[12px] opacity-35 w-full text-center truncate">{player.username}</p>
					</div>
				))} 
				<div className="flex items-center flex-col space-y-0.5 w-18">
				<Link to="/signup">
					<motion.img src={PlayerAdd} className="h-12 w-auto hover:cursor-pointer" whileHover={{scale: 1.07}} whileTap={{scale: 0.93}}/>
					{loggedInAccounts.length > 0 && (<p className="text-[12px] w-full text-center truncate invisible">placeholder</p>)}
				</Link>
				</div>
			</div>
		</>
	)
})

export default Players;