import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { SignUpFormType } from "./types"
import { usePlayerContext } from "./contexts/PlayerContext";
import { useLoginContext } from "./contexts/LoginContext";
import Loader from "./Loader";

interface CheckSubmitProps
{
	formData: SignUpFormType;
	setnumberOfLoggedInAccounts: React.Dispatch<React.SetStateAction<number>>;
	setIsLoading: (value: boolean) => void;
}

async function checkSubmit({ formData, setnumberOfLoggedInAccounts, setIsLoading}: CheckSubmitProps)
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

			setnumberOfLoggedInAccounts((count: number) => count + 1);
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

function SignUpModal()
{
	const { accounts, setnumberOfLoggedInAccounts, loggedInAccounts } = usePlayerContext();
	const { setShowSignUpModal, setShowLoginModal } = useLoginContext();

	const [formData, setFormData] = useState({username: '', email: '', password: '', confirmPassword: ''});
	const [emptyForm, setEmptyForm] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [validation, setValidation] = useState(
	{
		'Already logged in': false,
		'Username exists': false,
		'Email exists': false,
		'Password don\'t matches': false,
		'Password matches!': false
	});

	useEffect(() =>
	{
		setValidation(prev => (
		{
			...prev,
			'Already logged in': (loggedInAccounts.some(account => account.username === formData.username) || loggedInAccounts.some(account => account.email === formData.email)),
			'Username exists': accounts.some(account => account.username === formData.username),
			'Email exists': accounts.some(account => account.email === formData.email),
			'Password don\'t matches': (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) ? true : false,
			'Password matches!': (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword) ? true : false
		}));
		setEmptyForm(Object.values(formData).some(field => field === ""))
	}, [formData]);

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
				<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
					onClick={() => setShowSignUpModal(false)}>
					<IoMdClose size={24} />
				</button>
				<h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
				<form className="space-y-4"
					onSubmit={(e) => 
					{
						e.preventDefault();
						checkSubmit({formData, setnumberOfLoggedInAccounts, setIsLoading}).then(success => 
						{
							if (success)
							{
								setShowSignUpModal(false);
								setShowLoginModal(true);
							}
						})
					}}>
					<div>
						<label className="block text-sm font-medium mb-1">Username</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
							${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
							: 'border-gray-600 focus:border-white'} focus:outline-none`}
							name="username" type="text" placeholder="Choose a username" 
							onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Email</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
							${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
							: 'border-gray-600 focus:border-white'} focus:outline-none`}
							name="email" type="email" placeholder="Enter your email"
							onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Password</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
							${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
							: validation['Password don\'t matches'] ? 'border-red-800'
							: validation['Password matches!'] ? 'border-green-500'
							: 'border-gray-600 focus:border-white'}  focus:outline-none`}
							name="password" type="password" placeholder="Create a password"
							onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Confirm Password</label>
						<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
							${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
							: validation['Password don\'t matches'] ? 'border-red-800'
							: validation['Password matches!'] ? 'border-green-500'
							: 'border-gray-600 focus:border-white'} focus:outline-none`}
							name="confirmPassword" type="password" placeholder="Confirm your password"
							onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
					</div>
					{validation['Already logged in'] && 
					(
						<motion.div className="text-center text-sm text-[#ff914d] font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
							<p>You're already logged in!</p>
						</motion.div>
					)}
					{((validation['Username exists'] || validation['Email exists']) && !validation['Already logged in']) &&
					(
						<motion.div className="flex flex-col text-center text-sm gap-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
							<p>Account already exists</p>
							<a href="#" className="text-[#ff914d] hover:underline font-bold"
							onClick={() =>
							{
								setShowSignUpModal(false);
								setShowLoginModal(true)
							}}>Please login here</a>
						</motion.div>
					)}
					<div className="pt-2">
						<motion.button className={`w-full bg-[#ff914d]
							${(emptyForm || validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? 'opacity-30'
							: 'hover:bg-[#ab5a28] hover:cursor-pointer'} text-white py-2 px-4 rounded-3xl font-bold transition-colors shadow-2xl`}
							type="submit" disabled={(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches'])}
							whileHover={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? { scale: 1.03 } : {}}
							whileTap={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? { scale: 0.97 } : {}}>Sign Up
						</motion.button>
					</div>
					{!(validation['Already logged in'] && validation['Username exists'] || validation['Email exists']) &&
					(
						<motion.div className="text-center text-sm text-gray-400 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
							Already have an account?{" "} 
							<a href="#" className="text-[#ff914d] hover:underline font-bold" 
							onClick={() =>
							{
								setShowSignUpModal(false);
								setShowLoginModal(true)
							}}>Log in</a>
						</motion.div>)}
				</form>
			</motion.div>
		</motion.div>
	</AnimatePresence>
	)
}

export default SignUpModal