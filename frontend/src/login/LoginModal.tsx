import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";
import { PlayerType, LoginFormType, LoginValidationType } from "../types"
import { useAccountContext } from "../contexts/AccountContext";
import axios from "axios";

function LoginModal()
{
	const { loggedInAccounts, setLoggedInAccounts } = useAccountContext();
	
	const [show2FA, setShow2FA] = useState(false);
	const [token, setToken]     = useState('');
	const [tempJwt, setTempJwt] = useState('');
	
	const [formData, setFormData] = useState({ username: '', password: '' });
	const [emptyForm, setEmptyForm] = useState(true);
	const [validation, setValidation] = useState(
		{
			'Already logged in': false, 
			'Username not found': false, 
			'Password incorrect': false,
			'2FA Code incorrect': false
		});

	const navigate = useNavigate();
	
	async function check2FA()
	{
		try
		{
			const response = await axios.post(`http://${window.location.hostname}:5001/api/auth/verify-totp`,
			{
				token
			},
			{
				headers:
				{
					Authorization: `Bearer ${tempJwt}`
				}
			});
			if (response.data.success)
			{
				const account = response.data.account;
				const jwt     = response.data.token;
				
				const authenticatedAccount = { ...account, jwt };
				setLoggedInAccounts((prev) => {
					if (prev.some((p) => p.username === account.username)) {
						return prev;
					}
					const updatedPlayers = [...prev, authenticatedAccount];
					localStorage.setItem('loggedInAccounts', JSON.stringify(updatedPlayers));
					
					return updatedPlayers;
				});
				return true;
			}
		}
		catch (error: any)
		{
			if (error.response?.status === 401)
				setValidation(prev => ({...prev, ['2FA Code incorrect']: true}));
		}
		return false;
	}
	
	async function checkLogin()
	{
		const {username, password } = formData;
		try
		{
			const response = await axios.post(`http://${window.location.hostname}:5001/api/login`, { username, password });
			const twofaRequired = response.data.twofaRequired;

			console.log(response.data);
			if (twofaRequired)
			{
				const tempToken = response.data.token;
				setTempJwt(tempToken);
				console.log('jaja 2fa');
				setShow2FA(true);
				return false;
			}
			if (response.data.success)
			{
				const account = response.data.account;
				const jwt     = response.data.token;
				
				const authenticatedAccount = { ...account, jwt };
				setLoggedInAccounts((prev) =>
				{
					if (prev.some((p) => p.username === account.username))
						return prev;

					const updatedPlayers = [...prev, authenticatedAccount];
					localStorage.setItem('loggedInAccounts', JSON.stringify(updatedPlayers));
					
					return updatedPlayers;
				});
				return true;
			}
		}
		catch (error: any)
		{
			console.log(error.response.data.error);
			setValidation(prev => ({...prev, [error.response.data.error]: true}))
			return false;
		}
	}

	useEffect(() =>
	{
		setValidation(prev => (
		{
			...prev,
			'Already logged in': loggedInAccounts.some(player => player.username === formData.username),
			'Username not found': false, 
			'Password incorrect': false,
			'2FA Code incorrect': false
		}));
		setEmptyForm(Object.values(formData).some(field => field === ""));
	}, [formData, loggedInAccounts]);

	return(
	<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
		<div className="bg-[#2a2a2a] text-white p-8 rounded-lg w-md h-auto max-h-[80vh] overflow-y-auto relative shadow-xl">
		<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer" 
			onClick={() => navigate('/')}>
			<IoMdClose size={24} />
		</button>

		<h2 className="text-2xl font-bold mb-6 text-center">Login your account</h2>
		<form 
			className="space-y-4" 
			onSubmit={async (e) => 
			{
				e.preventDefault();
				if (show2FA)
				{
					const success = await check2FA();
					if (success) navigate('/');
				}
				else
				{
					const success = await checkLogin();
					if (success) navigate('/'); 
				}
			}} 
		>
			<div>
				<label className="block text-sm font-medium mb-1">Username</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border 
					${Object.values(validation).every((value) => !value) ? 'border-gray-600 focus:border-white' 
					: validation['Already logged in'] ? 'border-[#ff914d] focus:border-[#ff914d]' 
					: 'border-red-800'} focus:outline-none`} 
					name="username" type="text" placeholder="Type your username" maxLength={10}
					onChange={(e) => {setFormData({...formData, [e.target.name]: e.target.value})}}/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">Password</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border 
					${Object.values(validation).every((value) => !value) ? 'border-gray-600 focus:border-white' 
					: validation['Already logged in'] ? 'border-[#ff914d] focus:border-[#ff914d]' 
					: 'border-red-800'} focus:outline-none`} 
					name="password" type="password" placeholder="Type your password" maxLength={10}
					onChange={(e) => {setFormData({...formData, [e.target.name]: e.target.value})}}/>
			</div>

			{show2FA && <div>
				<label className="block text-sm font-medium mb-1">2FA Code</label>
				<input className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border 
					${Object.values(validation).every((value) => !value) ? 'border-gray-600 focus:border-white' 
					: validation['Already logged in'] ? 'border-[#ff914d] focus:border-[#ff914d]' 
					: 'border-red-800'} focus:outline-none`} 
					name="username" type="text" placeholder="Enter 6 digit code" maxLength={6}
					onChange={(e) => {setToken(e.target.value)}}/>
			</div>}
			{validation['Already logged in'] && 
			(
				<div className="text-center text-sm text-[#ff914d]">
					<p>You're already logged in!</p>
				</div>
			)}
			{validation['Username not found'] && 
			(
				<div className="text-center text-sm text-red-500">
					<p>Username not found, please try again.</p>
				</div>
			)}
			{validation['Password incorrect'] && 
			(
				<div className="text-center text-sm text-red-500">
					<p>Invalid Password</p>
				</div>
			)}
			{validation['2FA Code incorrect'] && 
			(
				<div className="text-center text-sm text-red-500">
					<p>Invalid 2FA Code</p>
				</div>
			)}
			<div className="pt-2">
				<motion.button className={`w-full bg-[#ff914d] text-white py-2 px-4 rounded-3xl font-bold transition-colors shadow-2xl 
					${(!emptyForm && Object.values(validation).every((value) => !value)) ? 'hover:bg-[#ab5a28] hover:cursor-pointer' : 'opacity-30'}`} 
					whileHover={(!emptyForm && Object.values(validation).every((value) => !value)) ? {scale: 1.03} : {}} 
					whileTap={(!emptyForm && Object.values(validation).every((value) => !value)) ? {scale: 0.97} : {}}  
					type="submit" disabled={emptyForm || Object.values(validation).some((value) => value)}>{show2FA ? "Authorize" : "Login"}</motion.button>
			</div>
		</form>
		</div>
	</div>
	)
}

export default LoginModal