import logo from "./assets/Logo.png";
import { CgProfile } from "react-icons/cg";

function Navbar()
{
	return (
	  <nav className="bg-[#313131] text-white p-4 flex justify-between items-center shadow-xl text-lg font-medium">
		<div className="flex items-center">
			<img src={logo} alt="Logo" className="h-16 w-auto" />
		</div>
		<ul className="space-x-10">
		  	<a href="#" className="hover:text-gray-400">Play</a>
		  	<a href="#" className="hover:text-gray-400">Stats</a>
		  	<a href="#" className="hover:text-gray-400">About</a>
		</ul>
		<div className="flex items-center space-x-2">
		<button className="flex items-center space-x-2 bg-transparent hover:text-gray-400 text-white py-2 px-4 rounded-3xl">
			<p>Sign up</p>
        	<CgProfile />
        </button>
        <button className="flex items-center space-x-2 bg-[#ff914d] hover:bg-[#ab5a28] text-white py-1 px-4 rounded-3xl shadow-lg">
			<p>Login</p>
        </button>
		</div>
	  </nav>
	);
  }
  
export default Navbar;