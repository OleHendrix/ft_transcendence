import React, { useEffect } from "react";
import { motion } from 'framer-motion';
import { useAccountContext } from "./contexts/AccountContext";
import { useLoginContext } from "./contexts/LoginContext";
import { Link } from 'react-router-dom';
import Player from "../assets/Player.svg";
import Player1 from "../assets/Player1.svg";
import Player2 from "../assets/Player2.svg";
import PlayerAdd from "../assets/PlayerAdd.svg"
import { PlayerState } from "./types";

const Players = React.memo(function Players()
{
	const { isPlaying, loggedInAccounts, setTriggerFetchAccounts } = useAccountContext();
	const { setShowSignUpModal, setShowPlayerStats, setIndexPlayerStats } = useLoginContext();

	return(
		<>
			<div className="flex items-center">
				{loggedInAccounts?.map((player, index) => 
				<div key={index} className="flex items-center flex-col space-y-0.5 w-18">
					<Link to={`/playerinfo/${player.username}`}>
						<motion.img src={player.avatar ? player.avatar : loggedInAccounts.length > 2 ? Player : index === 0 ? Player1 : index === 1 ? Player2 : Player}
							className="h-12 w-auto hover:cursor-pointer"
							whileHover={{scale: 1.07}}
							whileTap={{scale: 0.93}}
							onClick={() =>
							{
								if (isPlaying !== PlayerState.playing)
								{
									setIndexPlayerStats(index);
									setTriggerFetchAccounts(true);
								}
							}}/>
					</Link>
					<p className="text-[12px] opacity-35 w-full text-center truncate">{player.username}</p>
				</div>
				)}
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