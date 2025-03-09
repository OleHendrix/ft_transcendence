import { useState, useEffect } from "react";
import logo from "./assets/Logo.png";
import { CgProfile } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import Player from "./types"
import PLayerAdd from "./assets/PlayerAdd.svg"
import axios from "axios";

function usePlayers( setPlayers: (value: Player[]) => void)
{
	useEffect(() =>
	{
		async function fetchPlayers()
		{
			try
			{
				const response = await axios.get('http://localhost:5001/api/getplayers');
				if (response.data.success)
				{
					console.log("jupzz");
					setPlayers(response.data.players);
				}
			}
			catch (error: any)
			{
				console.log(error.response.data);
			}
		}
		fetchPlayers();
	}, [setPlayers])
}

function Players()
{
	const [showSignupModal, setShowSignupModal] = useState(false);
	const [players, setPlayers] = useState<Player[]>([]);
	usePlayers(setPlayers);

	return(
		<>
			<div className="flex items-center space-x-2">
				<img src={PLayerAdd} className="h-12 w-auto hover:cursor-pointer" onClick={() => setShowSignupModal(true)}/>
			</div>
			{showSignupModal && (<SignUpModal setShowSignupModal={setShowSignupModal} setPlayers={setPlayers} />)}
		</>
	)
}

async function checkSubmit({ username, email, password, confirmPassword}: { username: string; email: string; password: string; confirmPassword: string; },  setPasswordConfirm: (value: boolean) => void, setPlayers: (value: Player[]) => void)
{
	if (password !== confirmPassword)
	{
		setPasswordConfirm(false);
		return;
	}
	else
		setPasswordConfirm(true);
	try
	{
		const response = await axios.post("http://localhost:5001/api/addaccount", { username, email, password});
		if (response.data.succes)
		{
			console.log('me');
			usePlayers(setPlayers);
			console.log('mefefe');
		}
		else
			console.log('Other response? No Error? What?');
	}
	catch (error: any)
	{
		console.log(error.response.data);
	}
}

function SignUpModal({ setShowSignupModal, setPlayers }: { setShowSignupModal: (value: boolean) => void; setPlayers: (value: Player[]) => void })
{
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: ''
	});

	const [passwordConfirm, setPasswordConfirm] = useState(true);

	return(
	<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
		<div className="bg-[#2a2a2a] text-white p-8 rounded-lg w-full max-w-md relative shadow-2xl">
		<button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setShowSignupModal(false)}>
			<IoMdClose size={24} />
		</button>
		<h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
		<form className="space-y-4" onSubmit={(e) => {e.preventDefault(); checkSubmit(formData, setPasswordConfirm, setPlayers)}}>
			<div>
				<label className="block text-sm font-medium mb-1">Username</label>
				<input className="w-full p-2 bg-[#3a3a3a] rounded-3xl border border-gray-600 focus:border-[#ff914d] focus:outline-none" name="username" type="text" placeholder="Choose a username" onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Email</label>
				<input className="w-full p-2 bg-[#3a3a3a] rounded-3xl border border-gray-600 focus:border-[#ff914d] focus:outline-none" name="email" type="email" placeholder="Enter your email" onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Password</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border ${!passwordConfirm ? 'border-red-800' : 'border-gray-600 focus:border-[#ff914d]'}  focus:outline-none`} name="password" type="password" placeholder="Create a password" onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Confirm Password</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border ${!passwordConfirm ? 'border-red-800' : 'border-gray-600 focus:border-[#ff914d]'} focus:outline-none`} name="confirmPassword" type="password" placeholder="Confirm your password" onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
			</div>
			<div className="pt-2">
				<button className="w-full bg-[#ff914d] hover:bg-[#ab5a28] text-white py-2 px-4 rounded-3xl font-bold transition-colors shadow-2xl" type="submit">Sign Up</button>
			</div>
			<div className="text-center text-sm text-gray-400 mt-4">
				Already have an account?{" "} <a href="#" className="text-[#ff914d] hover:underline">Log in</a>
			</div>
		</form>
		</div>
	</div>
	)
}

function Navbar()
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
		<Players />
      </nav>
    </>
  );
}


export default Navbar;