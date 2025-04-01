import logo from "./assets/Logo.png";
import axios from "axios";
import Players from "./Players";
import Logo42 from "./assets/Logo42.svg"
import { useAccountContext } from "./contexts/AccountContext";

function Navbar()
{
	const { setIsPlaying, loggedInAccounts } = useAccountContext();

	async function toMenu()
	{
		setIsPlaying(false)
		try
		{
			await axios.post("http://localhost:5001/pong/end-game", { userID: loggedInAccounts[0].id });
		}
		catch (error)
		{
			console.log(error);
		}
	}

	return (
		<>
			<nav className="bg-[#313131] text-white h-[10vh] p-5 px-[6vw] flex justify-between items-center shadow-xl text-lg font-medium">
				<div className="flex items-center">
					<button onClick={() => toMenu()}>
						<img src={logo} alt="Logo" className="h-16 w-auto" />
					</button>
				</div>
				<div className="flex items-center">
					<img src={Logo42} className="h-18 w-auto" />
				</div>
				<Players />
			</nav>
		</>
	);
}

export default Navbar;