import logo from "../assets/Logo.png";
import axios from "axios";
import Players from "./Players";
import Logo42 from "../assets/Logo42.svg"
import { useAccountContext } from "./contexts/AccountContext";
import { PlayerState } from "./types";
import { useState } from "react";

function Navbar()
{
	const { setIsPlaying, loggedInAccounts, setShowLeaderboard } = useAccountContext();

	async function toMenu()
	{
		setIsPlaying(PlayerState.idle)
		try
		{
			await axios.post(`http://${window.location.hostname}:5001/pong/end-game`, { userID: loggedInAccounts[0].id });
			await axios.post(`http://${window.location.hostname}:5001/pong/delete`, { userID: loggedInAccounts[0].id });
		}
		catch (error)
		{
			console.log(error);
		}
	}

	return (
		<>
			<nav className="bg-[#313131] text-white h-[8vh] p-5 px-[6vw] flex justify-between items-center shadow-xl text-lg font-medium">
				<div className="flex items-center">
					<button onClick={() => toMenu()}>
						<img src={logo} alt="Logo" className="h-16 w-auto" />
					</button>
				</div>
				<div className="flex items-center">
					<button onClick={() => setShowLeaderboard(true)}>
						<p className="text-2xl">Leaderboard</p>
					</button>
				</div>
				{/* <div className="flex items-center">
					<img src={Logo42} className="h-18 w-auto" />
				</div> */}
				<Players />
			</nav>
		</>
	);
}

export default Navbar;