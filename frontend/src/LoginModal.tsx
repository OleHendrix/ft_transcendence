import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { motion } from 'framer-motion';
import { IoMdClose } from "react-icons/io";
import { PlayerType, LoginFormType, PlayerFoundStatusType } from "./types"
import { usePlayerContext } from "./contexts/PlayerContext";
import { useLoginContext } from "./contexts/LoginContext";
import axios from "axios";

interface CheckLoginProps
{
  formData: LoginFormType;
  setLoggedInPlayers: Dispatch<SetStateAction<PlayerType[]>>;
  setPlayerFound: Dispatch<SetStateAction<PlayerFoundStatusType>>;
}

async function checkLogin( { formData, setLoggedInPlayers, setPlayerFound }  : CheckLoginProps)
{
	const {username, password } = formData;
	try
	{ 
		const response = await axios.post("http://localhost:5001/api/login", { username, password });
		if (response.data.success)
		{
			const user = response.data.user;
			setLoggedInPlayers((prev) =>
			{
				if (prev.some((p) => p.username === user.username))
					return prev;
				const updatedPlayers = [...prev, user];
				localStorage.setItem("loggedInPlayers", JSON.stringify([...prev, user]));
				return updatedPlayers;
			});
			return true;
		}
	}
	catch (error: any)
	{
		if (error.response?.status === 400)
			setPlayerFound(prev => ({...prev, ['Username not found']: true}));
		else if (error.response?.status === 401)
			setPlayerFound(prev => ({...prev, ['Password incorrect']: true}));
		return false;
	}
}

function LoginModal()
{
	const { loggedInPlayers, setLoggedInPlayers } = usePlayerContext();
	const { setShowLoginModal } = useLoginContext();

	const [formData, setFormData] = useState({username: '', password: ''});
	const [emptyForm, setEmptyForm] = useState(true);
	const [playerFound, setPlayerFound] = useState(
	{
		'Already logged in': false, 
		'Username not found': false, 
		'Password incorrect': false
	});

	useEffect(() =>
	{
		setPlayerFound(prev => (
		{
			...prev,
			'Already logged in': loggedInPlayers.some(player => player.username === formData.username),
			'Username not found': false, 
			'Password incorrect': false 
		}));
		setEmptyForm(Object.values(formData).some(field => field === ""));
	}, [formData, loggedInPlayers]);

	return(
	<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
		<div className="bg-[#2a2a2a] text-white p-8 rounded-lg w-full max-w-md relative shadow-xl">
		<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer" 
			onClick={() =>{setShowLoginModal(false)}}>
			<IoMdClose size={24} />
		</button>

		<h2 className="text-2xl font-bold mb-6 text-center">Login your account</h2>
		<form 
			className="space-y-4" 
			onSubmit={async (e) => 
			{
				e.preventDefault(); 
				const success = await checkLogin({formData, setLoggedInPlayers, setPlayerFound});
				if (success) setShowLoginModal(false); 
			}} 
		>
			<div>
				<label className="block text-sm font-medium mb-1">Username</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border 
					${Object.values(playerFound).every((value) => !value) ? 'border-gray-600 focus:border-white' 
					: playerFound['Already logged in'] ? 'border-[#ff914d] focus:border-[#ff914d]' 
					: 'border-red-800'} focus:outline-none`} 
					name="username" type="text" placeholder="Type your username"
					onChange={(e) => {setFormData({...formData, [e.target.name]: e.target.value})}}/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Password</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border 
					${Object.values(playerFound).every((value) => !value) ? 'border-gray-600 focus:border-white' 
					: playerFound['Already logged in'] ? 'border-[#ff914d] focus:border-[#ff914d]' 
					: 'border-red-800'} focus:outline-none`} 
					name="password" type="password" placeholder="Type your password"
					onChange={(e) => {setFormData({...formData, [e.target.name]: e.target.value})}}/>
			</div>
			{playerFound['Already logged in'] && 
			(
				<div className="text-center text-sm text-[#ff914d]">
					<p>You're already logged in!</p>
				</div>
			)}
			{playerFound['Username not found'] && 
			(
				<div className="text-center text-sm text-red-500">
					<p>Username not found, please try again.</p>
				</div>
			)}
			{playerFound['Password incorrect'] && 
			(
				<div className="text-center text-sm text-[#ff914d]">
					<p>Invalid Password</p>
				</div>
			)}
			<div className="pt-2">
				<motion.button className={`w-full bg-[#ff914d] text-white py-2 px-4 rounded-3xl font-bold transition-colors shadow-2xl 
					${(!emptyForm && Object.values(playerFound).every((value) => !value)) ? 'hover:bg-[#ab5a28] hover:cursor-pointer' : 'opacity-30'}`} 
					whileHover={(!emptyForm && Object.values(playerFound).every((value) => !value)) ? {scale: 1.03} : {}} 
					whileTap={(!emptyForm && Object.values(playerFound).every((value) => !value)) ? {scale: 0.97} : {}}  
					type="submit" disabled={emptyForm || Object.values(playerFound).some((value) => value)}>Login</motion.button>
			</div>
		</form>
		</div>
	</div>
	)
}

export default LoginModal