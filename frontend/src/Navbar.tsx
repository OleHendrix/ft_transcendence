import logo from "../assets/Logo.png";
import axios from "axios";
import Players from "./Players";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccountContext } from "./contexts/AccountContext";
import { PlayerState } from "./types";
import { PiUserListLight } from "react-icons/pi";
const API_URL = import.meta.env.VITE_API_URL;

function Navbar()
{
	const { isPlaying, setIsPlaying, loggedInAccounts } = useAccountContext();
	const navigate = useNavigate();

	async function toMenu()
	{
		if (isPlaying !== PlayerState.playing)
			return;
		navigate('/');
		setIsPlaying(PlayerState.idle)
		try
		{
			await axios.post(`${API_URL}/pong/delete`,   { userID: loggedInAccounts[0].id });
		}
		catch (error)
		{
			console.log(error);
		}
	}

	return (
		<nav className="sticky top-0 backdrop-blur-lg text-white h-[8vh] min-h-[80px] flex items-center text-lg shadow-lg font-medium z-30">
			<div className="flex-grow flex justify-center">
				<button onClick={() => toMenu()}>
					<img src={logo} alt="Logo" className="h-16 w-auto" />
				</button>
			</div>

			<div className="absolute left-[6vw] md:left-[4vw]">
				<motion.button 
					className="hover:cursor-pointer animate-slide-in-left" 
					whileHover={{scale: 1.07}} 
					whileTap={{scale: 0.93}} 
					onClick={() =>
					{
						if (isPlaying !== PlayerState.playing)
							navigate('/leaderboard')
					}}>
					<PiUserListLight className="h-10 w-auto"/>
				</motion.button>
			</div>
			
			<div className="absolute right-[6vw] md:right-[4vw] hidden md:block">
				<Players />
			</div>
		</nav>
	);
}

export default Navbar;