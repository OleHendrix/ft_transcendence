import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from "react-icons/io";
import { PlayerType, SignupFormType, LoginFormType, PlayerFoundStatusType } from "./types"
import { usePlayerContext } from "./PlayerContext";
import { useLoginContext } from "./LoginContext";
import Loader from "./Loader";
import Player from "./assets/Player.svg";
import Player1 from "./assets/Player1.svg";
import Player2 from "./assets/Player2.svg";
import PlayerAdd from "./assets/PlayerAdd.svg"
import axios from "axios";

const Players = React.memo(function Players()
{
	const { loggedInPlayers } = usePlayerContext();
	const { setShowSignupModal, setShowPlayerStats, setIndexPlayerStats } = useLoginContext();

	return(
		<>
			<div className="flex items-center">
				{loggedInPlayers?.map((player, index) => 
				<div className="flex items-center flex-col space-y-0.5 w-18">
					<motion.img src={loggedInPlayers.length > 2 ? Player : index === 0 ? Player1 : index === 1 ? Player2 : Player} className="h-12 w-auto hover:cursor-pointer" whileHover={{scale: 1.07}} whileTap={{scale: 0.93}} onClick={() => {setIndexPlayerStats(index); setShowPlayerStats(true)}}/>
					<p className="text-[12px] opacity-35 w-full text-center truncate">{player.username}</p>
				</div>
				)}
				<div className="flex items-center flex-col space-y-0.5 w-18">
					<motion.img src={PlayerAdd} className="h-12 w-auto hover:cursor-pointer" whileHover={{scale: 1.07}} whileTap={{scale: 0.93}} onClick={() => setShowSignupModal(true)}/>
					{loggedInPlayers.length > 0 && (<p className="text-[12px] w-full text-center truncate invisible">placeholder</p>)}
				</div>
			</div>
		</>
	)
})

export function PlayerStats()
{
	const { loggedInPlayers, setLoggedInPlayers } = usePlayerContext();
	const { setShowPlayerStats, indexPlayerStats } = useLoginContext();

	return (
		<AnimatePresence>
			<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
				<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-full max-w-md relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
					<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer" onClick={() => setShowPlayerStats(false)}>
						<IoMdClose size={24} />
					</button>

					<div className="flex flex-col items-center gap-2">
						<h2 className="text-2xl font-bold text-center">{loggedInPlayers[indexPlayerStats]?.username}</h2>
						<img src={loggedInPlayers.length > 2 ? Player : indexPlayerStats === 0 ? Player1 : indexPlayerStats === 1 ? Player2 : Player} className="h-16 w-auto"/>
					</div>

					<div className="flex flex-col w-full text-left items-start space-y-4">
						<div className="w-full">
							<p className="block text-sm font-medium mb-1">Username</p>
							<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInPlayers[indexPlayerStats]?.username}</p>
						</div>
						<div className="w-full">
							<p className="block text-sm font-medium mb-1">Email</p>
							<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInPlayers[indexPlayerStats]?.email}</p>
						</div>
						<div className="w-full">
							<p className="block text-sm font-medium mb-1">Password</p>
							<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{('').padStart(loggedInPlayers[indexPlayerStats]?.password.length, '*')}</p>
						</div>
					</div>

					<div className="flex flex-col items-center mt-4">
						<h2 className="text-2xl font-bold text-center">Stats</h2>
						<div className="w-full grid grid-cols-3 gap-2 p-2 mt-2">
							<div className="stat flex flex-col items-center">
								<div className="stat-title text-green-800 font-black">Wins</div>
								<div className="stat-value">{loggedInPlayers[indexPlayerStats]?.wins}</div>
							</div>
							<div className="stat flex flex-col items-center">
								<div className="stat-title font-black">Draws</div>
								<div className="stat-value">{loggedInPlayers[indexPlayerStats]?.draws}</div>
							</div>
							<div className="stat flex flex-col items-center">
								<div className="stat-title text-red-800 font-black">Loses</div>
								<div className="stat-value">{loggedInPlayers[indexPlayerStats]?.loses}</div>
							</div>
						</div>
					</div>
					<motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer" whileHover={ {scale: 1.03}} whileTap={ {scale: 0.97}}
					onClick={() =>
					{
						const updatedPlayers = loggedInPlayers.filter((player, index) => index !== indexPlayerStats)
						setLoggedInPlayers(updatedPlayers);
						localStorage.setItem('loggedInPlayers', JSON.stringify(updatedPlayers));
						setShowPlayerStats(false)
					}}>Logout</motion.button> 
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

interface CheckSubmitProps
{
  formData: SignupFormType;
  setPlayerCount: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: (value: boolean) => void;
}

async function checkSubmit({ formData, setPlayerCount, setIsLoading}: CheckSubmitProps)
{
	const { username, email, password, confirmPassword } = formData;
	setIsLoading(true);
	let success = false;
    const startTime = Date.now();

	try
	{
		const response = await axios.post("http://localhost:5001/api/addaccount", { username, email, password});
		if (response.data.success)
		{

			setPlayerCount((count: number) => count + 1);
			success = true;
		}
		else
			console.log('Other response? No Error? What?');
	}
	catch (error: any)
	{
		console.log(error.response.data);
		success = false;
	}

	const elapsedTime = Date.now() - startTime;
  	const remainingTime = Math.max(0, 2000 - elapsedTime);
  	await new Promise(resolve => setTimeout(resolve, remainingTime));
  	setIsLoading(false);
	return success;
}

interface CheckLoginProps
{
  formData: LoginFormType;
  setLoggedInPlayers: Dispatch<SetStateAction<PlayerType[]>>;
  setPlayerFound: Dispatch<SetStateAction<PlayerFoundStatusType>>;
}

async function checkLogin( { formData, setLoggedInPlayers, setPlayerFound }  : CheckLoginProps)
{
	const {username, password } = formData;
	try { 
		console.log('check')
		const response = await axios.post("http://localhost:5001/api/login", { username, password });

		if (response.data.success) {
			const user = response.data.user;

			setLoggedInPlayers((prev) => {
				if (prev.some((p) => p.username === user.username)) {
					return prev;
				}

				const updatedPlayers = [...prev, user];
				localStorage.setItem("loggedInPlayers", JSON.stringify([...prev, user]));
				return updatedPlayers;
			});
			return true;
		}
	} catch (error: any) {
		if (error.response?.status === 400) { //user not found
			setPlayerFound(prev => ({...prev, ['Username not found']: true}));
		} else if (error.response?.status === 401) { // incorrect password
			setPlayerFound(prev => ({...prev, ['Password incorrect']: true}));
		}
		return false;
	}
}


export function SignUpModal()
{
	const { players, setPlayerCount } = usePlayerContext();
	const { setShowSignupModal, setShowLoginModal } = useLoginContext();


	const [formData, setFormData] = useState({username: '', email: '', password: '', confirmPassword: ''});
	const [emptyForm, setEmptyForm] = useState(true);
	const [passwordConfirm, setPasswordConfirm] = useState(1);
	const [alreadyExists, setAlreadyExists] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	return(
	<AnimatePresence>
		<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
			<motion.div className="bg-[#2a2a2a] text-white p-8 rounded-lg w-full max-w-md relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
				{isLoading &&
				(
					<div className="absolute inset-0 bg-[#2a2a2a] bg-opacity-95 rounded-lg flex flex-col items-center justify-center z-10">
              			<Loader />
					</div>
				)}
				<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer" onClick={() => setShowSignupModal(false)}>
					<IoMdClose size={24} />
				</button>
				<h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
				<form className="space-y-4" onSubmit={(e) => {e.preventDefault(); checkSubmit({formData, setPlayerCount, setIsLoading}).then(success => {if (success) {setShowSignupModal(false); setShowLoginModal(true);}})}}>
					<div>
						<label className="block text-sm font-medium mb-1">Username</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border ${alreadyExists ? 'border-[#ff914d] focus:border-[#ff914d]' : 'border-gray-600 focus:border-white'} focus:outline-none`} name="username" type="text" placeholder="Choose a username" 
						onChange={(e) => {players.some(player => player.username === e.target.value) ? setAlreadyExists(true) : setAlreadyExists(false); setFormData({...formData, [e.target.name]: e.target.value}); const updatedValues = {...formData, [e.target.name]: e.target.value}; Object.values(updatedValues).every(field => field !== '') ? setEmptyForm(false) : setEmptyForm(true)}}/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Email</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border ${alreadyExists ? 'border-[#ff914d] focus:border-[#ff914d]' : 'border-gray-600 focus:border-white'} focus:outline-none`} name="email" type="email" placeholder="Enter your email"
						onChange={(e) => {players.some(player => player.email === e.target.value) ? setAlreadyExists(true) : setAlreadyExists(false); setFormData({...formData, [e.target.name]: e.target.value}); const updatedValues = {...formData, [e.target.name]: e.target.value}; Object.values(updatedValues).every(field => field !== '') ? setEmptyForm(false) : setEmptyForm(true)}}/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Password</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border ${alreadyExists ? 'border-[#ff914d] focus:border-[#ff914d]' : !passwordConfirm ? 'border-red-800' : passwordConfirm === 2 ? 'border-green-500' : 'border-gray-600 focus:border-white'}  focus:outline-none`} name="password" type="password" placeholder="Create a password"
						onChange={(e) => {(!e.target.value || e.target.value !== formData.confirmPassword) ? setPasswordConfirm(0) : setPasswordConfirm(2); setFormData({...formData, [e.target.name]: e.target.value}); const updatedValues = {...formData, [e.target.name]: e.target.value}; Object.values(updatedValues).every(field => field !== '') ? setEmptyForm(false) : setEmptyForm(true)}}/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Confirm Password</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border ${alreadyExists ? 'border-[#ff914d] focus:border-[#ff914d]' : !passwordConfirm ? 'border-red-800' : passwordConfirm === 2 ? 'border-green-500' : 'border-gray-600 focus:border-white'} focus:outline-none`} name="confirmPassword" type="password" placeholder="Confirm your password"
						onChange={(e) => {(!e.target.value || e.target.value !== formData.password) ? setPasswordConfirm(0) : setPasswordConfirm(2); setFormData({...formData, [e.target.name]: e.target.value}); const updatedValues = {...formData, [e.target.name]: e.target.value}; Object.values(updatedValues).every(field => field !== '') ? setEmptyForm(false) : setEmptyForm(true)}}/>
					</div>
					{alreadyExists && ( <motion.div className="flex flex-col text-center text-sm gap-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}> <p>Account already exists</p> <a href="#" className="text-[#ff914d] hover:underline font-bold" onClick={() => {setShowSignupModal(false); setShowLoginModal(true)}}>Please loggin here</a></motion.div>)}
					<div className="pt-2"> <motion.button className={`w-full bg-[#ff914d] ${(emptyForm || alreadyExists || passwordConfirm !== 2) ? 'opacity-30' : 'hover:bg-[#ab5a28] hover:cursor-pointer'} text-white py-2 px-4 rounded-3xl font-bold transition-colors shadow-2xl`} type="submit" disabled={emptyForm || alreadyExists || passwordConfirm !== 2} whileHover={!(emptyForm || alreadyExists || passwordConfirm !== 2) ? { scale: 1.03 } : {}}whileTap={!(emptyForm || alreadyExists || passwordConfirm !== 2) ? { scale: 0.97 } : {}}>Sign Up</motion.button></div>
					{!alreadyExists && (<motion.div className="text-center text-sm text-gray-400 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Already have an account?{" "} <a href="#" className="text-[#ff914d] hover:underline font-bold" onClick={() => {setShowSignupModal(false); setShowLoginModal(true)}}>Log in</a></motion.div>)}
				</form>
			</motion.div>
		</motion.div>
	</AnimatePresence>
	)
}

export function LoginModal()
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
				name="username" 
				type="text" 
				placeholder="Type your username"
				onChange={(e) => {setFormData({...formData, [e.target.name]: e.target.value})}}/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Password</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border 
					${Object.values(playerFound).every((value) => !value) ? 'border-gray-600 focus:border-white' 
					: playerFound['Already logged in'] ? 'border-[#ff914d] focus:border-[#ff914d]' 
					: 'border-red-800'} focus:outline-none`} 
				name="password"
				type="password"
				placeholder="Type your password"
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

export default Players;