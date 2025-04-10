import logo from "../assets/Logo.png";
import axios from "axios";
import Players from "./Players";
import { motion } from 'framer-motion';
import { useAccountContext } from "./contexts/AccountContext";
import { PlayerState } from "./types";
import { PiUserListLight } from "react-icons/pi";

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
		<nav className="bg-[#313131] text-white h-[8vh] p-5 px-[6vw] flex items-center shadow-xl text-lg font-medium relative">
			<div className="absolute left-[6vw]">
				<motion.button 
					className="hover:cursor-pointer" 
					whileHover={{scale: 1.07}} 
					whileTap={{scale: 0.93}} 
					onClick={() => setShowLeaderboard(true)}>
					<PiUserListLight className="h-10 w-auto"/>
				</motion.button>
			</div>

			<div className="flex-grow flex justify-center">
				<button onClick={() => toMenu()}>
					<img src={logo} alt="Logo" className="h-16 w-auto" />
				</button>
			</div>
			
			<div className="absolute right-[6vw]">
				<Players />
			</div>
		</nav>
		</>
	);
}

export default Navbar;