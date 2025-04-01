import React, { useState, useEffect } from "react";
import { useAccountContext } from "./contexts/AccountContext";
import { useLoginContext } from "./contexts/LoginContext";
import Player from "./assets/Player.svg";
import Player1 from "./assets/Player1.svg";
import Player2 from "./assets/Player2.svg";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import Playerstats from "./Playerstats";
import EditProfile from "./EditProfile";
import { LiaUserEditSolid } from "react-icons/lia";
import { TiArrowBackOutline } from "react-icons/ti";
import { FiEdit3 } from "react-icons/fi";
import { TfiSave } from "react-icons/tfi";
import { Enable2FA } from "./EditProfile";

import axios from "axios";

interface ShowInfoProps
{
	editProfile: boolean,
	setEditProfile: React.Dispatch<React.SetStateAction<boolean>>
	settingUp2FA: boolean,
	setSettingUp2FA: React.Dispatch<React.SetStateAction<boolean>>
}

function ShowInfo( {editProfile, setEditProfile, settingUp2FA, setSettingUp2FA}: ShowInfoProps )
{
	const { accounts, loggedInAccounts, setTriggerFetchAccounts, setLoggedInAccounts }  = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	const [formData, setFormData] = useState({username: loggedInAccounts[indexPlayerStats].username, email: loggedInAccounts[indexPlayerStats].email, password: '', confirmPassword: ''});
	const [emptyForm, setEmptyForm] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [editPassword, setEditPassword] = useState(false);
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
		let passwordDontMatch = false;
		if (editPassword && (formData.password || formData.confirmPassword))
  			passwordDontMatch = formData.password !== formData.confirmPassword;

		let passwordMatches = false;
		if (editPassword)
		{
 			if (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword)
    			passwordMatches = true;
		}
		setValidation(prev => (
		{
			...prev,
			'Already logged in': ((loggedInAccounts.some(player => player.username === formData.username) && loggedInAccounts[indexPlayerStats].username !== formData.username ) || (loggedInAccounts.some(player => player.email === formData.email) && loggedInAccounts[indexPlayerStats].email !== formData.email)),
			'Username exists': (accounts.some(player => player.username === formData.username) && loggedInAccounts[indexPlayerStats].username !== formData.username),
			'Email exists': (accounts.some(player => player.email === formData.email) && loggedInAccounts[indexPlayerStats].email !== formData.email),
			'Password don\'t matches': passwordDontMatch,
			'Password matches!': passwordMatches
		}));
		const requiredFields = {...formData} as {[key: string]: string};
  		if (!editPassword)
		{
    		delete requiredFields.password;
    		delete requiredFields.confirmPassword;
  		}
  		const isEmptyForm = editPassword ? Object.values(formData).some(field => field === "") : [formData.username, formData.email].some(field => field === "");
  
 		const currentAccount = loggedInAccounts[indexPlayerStats];
		const hasChanges = editPassword ? (formData.username !== currentAccount.username 
		|| formData.email !== currentAccount.email || (formData.password && formData.password !== ""))
		: (formData.username !== currentAccount.username
		|| formData.email !== currentAccount.email);

  		setEmptyForm(isEmptyForm || !hasChanges);
	}, [formData, editPassword]);

	const disable2FA = async () =>
	{
		try
		{
			const response = await axios.post('http://localhost:5001/api/auth/delete-totp',
			{
				username: loggedInAccounts[indexPlayerStats].username
			});
		}
		catch (error)
		{
			console.error('Error disabling 2FA:', error);
		}
	}

	function cancelEdit()
	{
		setEditProfile(false);
		setEditPassword(false);
		setSettingUp2FA(false);
		setFormData( prev => (
		{
			...prev,
			username: loggedInAccounts[indexPlayerStats].username,
			email: loggedInAccounts[indexPlayerStats].email,
			password: '',
			confirmPassword: ''
		}))
	};

	return (
		<div className="flex flex-col w-full text-left space-y-4 items-center">
			{ editProfile &&
			(
			<div className="w-full flex text-xs justify-between whitespace-nowrap gap-2">
					<motion.button className={`w-full shadow-2xl bg-[#ff914d]
					${(emptyForm || validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? 'opacity-30'
					: 'hover:bg-[#ab5a28] hover:cursor-pointer'} text-white py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
					disabled={(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches'])}
					whileHover={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? { scale: 1.03 } : {}}
					whileTap={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? { scale: 0.97 } : {}}
					onClick={() =>
					{
						async function updatePlayer()
						{
							try
							{
								const response = await axios.post("http://localhost:5001/api/update-account",
								{
									prev_username: loggedInAccounts[indexPlayerStats].username,
									username: formData.username, 
									email: formData.email, 
									password: formData.password
								})
								if (response.data.success)
								{
									const updatedloggedInAccounts = [...loggedInAccounts];
									updatedloggedInAccounts[indexPlayerStats] =
									{
										...updatedloggedInAccounts[indexPlayerStats],
										username: response.data.user.username,
										email: response.data.user.email,
										password: response.data.user.password
									};
									setLoggedInAccounts(updatedloggedInAccounts);
									localStorage.setItem('loggedInAccounts', JSON.stringify(updatedloggedInAccounts));
									setEditProfile(false);
									setEditPassword(false);
									setTriggerFetchAccounts(true);
								}
							}
							catch (error: any)
							{
								console.log(error.response.data);
							}
						}
						updatePlayer();
					}
					}>Save changes
				</motion.button>
				<motion.button className={`w-full bg-red-900 hover:bg-red-700 hover:cursor-pointer text-white py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
					whileHover={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? { scale: 1.03 } : {}}
					whileTap={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password don\'t matches']) ? { scale: 0.97 } : {}}
					onClick={() => {cancelEdit()}}>Cancel
				</motion.button>
			</div>
			)}
			<div className="w-full">
				<div className="flex items-end justify-between gap-2">
					<p className="block text-sm font-medium mb-1">Username</p>
				</div>
				{editProfile ?
				(
					<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
					${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
					: 'border-gray-600 focus:border-white'} focus:outline-none`}
					name="username" type="text" value={formData.username}
					onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
				) :
				(
					<div className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p>{loggedInAccounts[indexPlayerStats]?.username}</p>
					</div>
				)}
			</div>
			<div className="w-full">
				<div className="flex items-end justify-between gap-2">
					<p className="block text-sm font-medium mb-1">Email</p>
				</div>
				{editProfile ?
				(
					<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
					${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
					: 'border-gray-600 focus:border-white'} focus:outline-none`}
					name="email" type="email" value={formData.email}
					onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
				) :
				(
					<div className=" w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p className="">{loggedInAccounts[indexPlayerStats]?.email}</p>
					</div>
				)}
			</div>
			<div className="w-full">
				<div className="flex items-end justify-between gap-2">
					<p className="block text-sm font-medium mb-1">Password</p>
				</div>
				{editPassword ?
				(
					<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
					${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
					: validation['Password don\'t matches'] ? 'border-red-800'
					: validation['Password matches!'] ? 'border-green-500'
					: 'border-gray-600 focus:border-white'}  focus:outline-none`}
					name="password" type="password" placeholder="Choose a new password"
					onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
				) :
				(
					<div className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p>{('').padStart(10, '*')}</p>
						{editProfile &&
						(
							<motion.button className="items-start mb-1 text-[#ff914d] hover:text-[#ab5a28] cursor-pointer opacity-30 hover:opacity-100"
							key="edit-username" 
							whileHover={ {scale: 1.17}}
							whileTap={ {scale: 0.87}}
							onClick={() => setEditPassword(true)}><FiEdit3 size={18} />
							</motion.button>
						)}
					</div>
				)}
			</div>
			{editPassword &&
			(
				<div className="w-full">
					<p className="block text-sm font-medium mb-1">Confirm Password</p>
					<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
					${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
					: validation['Password don\'t matches'] ? 'border-red-800'
					: validation['Password matches!'] ? 'border-green-500'
					: 'border-gray-600 focus:border-white'} focus:outline-none`}
					name="confirmPassword" type="password" placeholder="Confirm your new password"
					onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
				</div>
			)}
			{!settingUp2FA && 
			(
			<div className="w-full">
					<p className="block text-sm font-medium mb-1">2FA Enabled</p>
				{ editProfile ?
				(





					
					(!loggedInAccounts[indexPlayerStats].totpSecret  && <button className="bg-[#ff914d] text-white px-4 py-1 rounded-2xl font-semibold hover:bg-[#ab5a28] cursor-pointer transition"
					onClick={() => { setSettingUp2FA(true) } }>
					Enable
					</button>) ||
					(loggedInAccounts[indexPlayerStats].totpSecret && <button className="bg-[#ff914d] text-white px-4 py-1 rounded-2xl font-semibold hover:bg-[#ab5a28] transition"
					onClick={disable2FA}>
					Disable
					</button>)
				) :
				(
					<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInAccounts[indexPlayerStats]?.totpSecret ? 'Yes' : 'No'}</p>
				)}
				</div>
			)}
			{settingUp2FA && editProfile && <Enable2FA />}
			{validation['Already logged in'] && 
			(
				<motion.div className="text-center text-sm text-[#ff914d] font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
					<p>You're already logged in!</p>
				</motion.div>
			)}
			{((validation['Username exists'] || validation['Email exists']) && !validation['Already logged in']) &&
			(
				<motion.div className="text-center text-sm text-[#ff914d] font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
					<p>Account already exists</p>
				</motion.div>
			)}
		</div>
	);
}

function PlayerInfo()
{
	const { loggedInAccounts, setLoggedInAccounts }  = useAccountContext();
	const { setShowPlayerStats, indexPlayerStats } = useLoginContext();

	const [editProfile, setEditProfile] = useState(false);
	const [ settingUp2FA, setSettingUp2FA ] = useState(false);

	const deleteAccount = async () =>
	{
		try
		{
			const response = await axios.post('http://localhost:5001/api/delete-account',
			{
				username: loggedInAccounts[indexPlayerStats].username
			});
		}
		catch (error)
		{
			console.error('Error deleting account:', error);
		}
	}

	return (
		<AnimatePresence>
			<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
				<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-full max-w-md relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
					<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => setShowPlayerStats(false)}>
						<IoMdClose size={24} />
					</button>
					<div className="flex flex-col items-center gap-2">
						<h2 className="text-2xl font-bold text-center">{loggedInAccounts[indexPlayerStats]?.username}</h2>
						<img src={loggedInAccounts.length > 2 ? Player : indexPlayerStats === 0 ? Player1 : indexPlayerStats === 1 ? Player2 : Player} className="h-16 w-auto"/>
						{!editProfile &&
						(
							<div className="flex flex-col items-center">
							<motion.button className="items-center mt-1 text-[#ff914d] hover:text-[#ab5a28] cursor-pointer"
								key="edit-button" 
								whileHover={ {scale: 1.17}}
								whileTap={ {scale: 0.87}}
								onClick={() => setEditProfile(true)}><LiaUserEditSolid size={24} />
							</motion.button>
							<p className="font-thin text-xs opacity-40">Edit profile</p>
							</div>
						)}
					</div>
					<ShowInfo editProfile={editProfile} setEditProfile={setEditProfile} settingUp2FA={settingUp2FA} setSettingUp2FA={setSettingUp2FA}/>
					{!editProfile && <Playerstats/>}
					{!editProfile && <motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
						whileHover={ {scale: 1.03}}
						whileTap={ {scale: 0.97}}
						onClick={() =>
						{
							const updatedaccounts = loggedInAccounts.filter((player, index) => index !== indexPlayerStats)
							setLoggedInAccounts(updatedaccounts);
							localStorage.setItem('loggedInAccounts', JSON.stringify(updatedaccounts));
							setShowPlayerStats(false)
						}}>Logout
					</motion.button>
					}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

	// {editProfile && <motion.button className="items-center"
	// 					whileHover={ {scale: 1.03}}
	// 					whileTap={ {scale: 0.97}}
	// 					onClick={() => { setEditProfile(false) } }><TfiSave />
	// 				// {editProfile  && <EditProfile />}
	// 				// {!editProfile && <ShowInfo />}
	// 				// {!editProfile && <accountstats />}
	// 				// {!editProfile && <motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
					// 	whileHover={ {scale: 1.03}}
					// 	whileTap={ {scale: 0.97}}
					// 	onClick={() =>
					// 	{
					// 		const updatedaccounts = loggedInAccounts.filter((player, index) => index !== indexPlayerStats)
					// 		setloggedInAccounts(updatedaccounts);
					// 		localStorage.setItem('loggedInAccounts', JSON.stringify(updatedaccounts));
					// 		setShowPlayerStats(false)
					// 	}}>Logout
					// </motion.button>}
					// {editProfile && <motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
					// 	whileHover={ {scale: 1.03}}
					// 	whileTap={ {scale: 0.97}}
					// 	onClick={() =>
					// 	{
					// 		deleteAccount();
					// 		const updatedaccounts = loggedInAccounts.filter((player, index) => index !== indexPlayerStats)
					// 		setloggedInAccounts(updatedaccounts);
					// 		localStorage.setItem('loggedInAccounts', JSON.stringify(updatedaccounts));
					// 		setShowPlayerStats(false);
					// 	}}>Delete Account
					// </motion.button>}

export default PlayerInfo