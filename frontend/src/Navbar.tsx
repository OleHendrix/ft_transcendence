import logo from "./assets/Logo.png";
import Players from "./Players";
import Logo42 from "./assets/Logo42.svg"
import { usePlayerContext } from "./contexts/PlayerContext";

function Navbar()
{
  const { setIsPlaying } = usePlayerContext();
	return (
    <>
      <nav className="bg-[#313131] text-white h-[8vh] p-5 px-[6vw] flex justify-between items-center shadow-xl text-lg font-medium">
        <div className="flex items-center">
          <button onClick={() => setIsPlaying(false)}>
            <img src={logo} alt="Logo" className="h-16 w-auto"   />
          </button>
        </div>
		<div className="flex items-center">
			<img src={Logo42} className="h-18 w-auto"/>
        </div>
		    <Players />
      </nav>
    </>
  );
}

export default Navbar;