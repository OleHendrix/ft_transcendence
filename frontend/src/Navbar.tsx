import { Dispatch, SetStateAction } from "react";
import logo from "./assets/Logo.png";
import Players from "./Players";
import PlayerType from "./types"

function Navbar({ players, setPlayerCount, loggedInPlayers, setLoggedInPlayers }: { players: PlayerType[]; setPlayerCount: (value: number) => void; loggedInPlayers: PlayerType[]; setLoggedInPlayers: Dispatch<SetStateAction<PlayerType[]>> })
{
	return (
    <>
      <nav className="bg-[#313131] text-white p-4 px-20 flex justify-between items-center shadow-xl text-lg font-medium">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>
        <ul className="space-x-10">
          <a href="#" className="hover:text-gray-400">Play</a>
          <a href="#" className="hover:text-gray-400">Stats</a>
          <a href="#" className="hover:text-gray-400">About</a>
        </ul>
		<Players players={players} setPlayerCount={setPlayerCount} loggedInPlayers={loggedInPlayers} setLoggedInPlayers={setLoggedInPlayers}/>
      </nav>
    </>
  );
}

export default Navbar;