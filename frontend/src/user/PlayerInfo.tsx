import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useAccountContext } from "../contexts/AccountContext";
import Player from "../../assets/Player.svg";
import { motion, AnimatePresence } from 'framer-motion';
import Playerstats from "./Playerstats";
import { IoMdClose, IoIosStats } from "react-icons/io";
import { LiaUserEditSolid } from "react-icons/lia";
import { BiLogOut } from "react-icons/bi";
import { FiEdit3, FiCamera } from "react-icons/fi";
import { MdOutlineDeleteForever } from "react-icons/md";
import ImageCropper from "../ImageCrop";

import axios from "axios";
import { PlayerType } from "../types";

interface EditIconProps
{
  onClick: () => void;
  keyName: string;
}

function EditIcon({ onClick, keyName }: EditIconProps)
{
	return(
		<motion.button className="items-start mb-1 text-[#ff914d] hover:text-[#ab5a28] cursor-pointer opacity-30 hover:opacity-100"
			key="edit-username" 
			whileHover={ {scale: 1.17}}
			whileTap={ {scale: 0.87}}
			onClick={onClick}><FiEdit3 size={18} />
		</motion.button>
	)
}

interface InputFieldProps
{
	name: string;
	value?: string;
	placeholder?: string;
	validation: Record<string, boolean>;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isPasswordField?: boolean; 
}

function InputField({ name, value, placeholder, validation, onChange, isPasswordField } : InputFieldProps)
{
	function getBorderColor()
	{
		if (validation['Already logged in'] || validation['Username exists'] || validation['Email exists'])
      		return 'border-[#ff914d] focus:border-[#ff914d]';
		else if (isPasswordField && validation['Password don\'t matches'])
      		return 'border-red-800';
		else if (isPasswordField && validation['Password matches!'])
      		return 'border-green-500';
		else
      		return 'border-gray-600 focus:border-white';
	}
	return (
		<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border ${getBorderColor()} focus:outline-none`}
      		name={name} type={name === "email" ? 'email' : (name === "password" || name === "confirmPassword") ? 'password' : 'text'} value={value} placeholder={placeholder} onChange={onChange}/>
		);
}

interface Enable2FAProps
{
	setSettingUp2FA:  	React.Dispatch<React.SetStateAction<boolean>>;
	selectedAccount: 	PlayerType | undefined;
}

export function Enable2FA({setSettingUp2FA, selectedAccount}: Enable2FAProps)
{
	const { loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts }  = useAccountContext();

	const [token, setToken]     = useState('');
	const [falseCode, setFalseCode] = useState(false);
	const [qrCode, setQrCode]   = useState<string | null>(null);
	const [scannedQrCode, setScannedQrCode ] = useState(false);

	useEffect(() =>
	{
		const handleEnable2FA = async () =>
		{
			try
			{
				const res = await axios.post('http://localhost:5001/api/auth/setup-totp',
				{
					username: selectedAccount?.username
				});
				setQrCode(res.data.qrCodeUrl);
				console.log('QR Code:', qrCode);
			}
			catch (err)
			{
				console.error('Error enabling 2FA:', err);
			}
		};
		handleEnable2FA();
	}, [loggedInAccounts]);
	
	const verify2FA = async () =>
	{
		try
		{
			const response = await axios.post('http://localhost:5001/api/auth/verify-totp',
			{
				username:  selectedAccount?.username,
				token
			});
			if (response.data.success)
			{

				const updatedLoggedInAccounts = loggedInAccounts.map((account) =>
				account.username === selectedAccount?.username ?
				{ 
					...account, 
					twofa: response.data.user.twofa 
				} : account);
				setLoggedInAccounts(updatedLoggedInAccounts);
				localStorage.setItem('loggedInAccounts', JSON.stringify(updatedLoggedInAccounts));
				setTriggerFetchAccounts(true);
				setSettingUp2FA(false);
			}
			else
				alert('Invalid code');
		}
		catch (err)
		{
			console.error('Verification failed', err);
			setFalseCode(true);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center w-full h-full">
  			<div className="rounded-xl bg-[#2a2a2a] text-center w-full">
    		{!scannedQrCode &&
			(
				<>
      				<p className="text-sm font-medium mb-2">Scan this QR code with Google Authenticator:</p>
      				{qrCode && 
						<div className="flex justify-center mb-4 ">
							<img src={qrCode} alt="2FA QR Code" className="rounded-lg shadow-3xl" />
						</div>
					}
      				<div className="flex justify-center">
					<motion.button className={`w-[50%] bg-[#ff914d] hover:bg-[#ab5a28] hover:cursor-pointer text-white text-xs py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
						whileHover={{ scale: 1.03 }}
						whileTap={{scale: 0.97 }}
						onClick={() => {setScannedQrCode(true)}}>Continue
					</motion.button>
      				</div>
    			</>
			)}
    		{scannedQrCode && 
			(
				<div className="w-full">
      				<input
        				type="text"
        				maxLength={6}
        				value={token}
        				onChange={(e) => {setToken(e.target.value); if (falseCode) setFalseCode(false)}}
        				placeholder="Enter 6-digit code"
        				className={`w-full p-2 rounded-3xl bg-[#3a3a3a] text-white mb-4 border ${falseCode ? 'border-red-800' :  'border-gray-600 focus:border-white'} focus:outline-none`}
      			/>
      			<div className="flex justify-center">
				<motion.button className={`w-full bg-[#ff914d] hover:bg-[#ab5a28] hover:cursor-pointer text-white text-xs py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
					whileHover={{ scale: 1.03 }}
					whileTap={{scale: 0.97 }}
					onClick={() => {verify2FA()}}>Verify
				</motion.button>
      			</div>
    		</div>
		)}
  			</div>
		</div>
	);
}

interface ShowInfoProps
{
	editProfile: boolean,
	setEditProfile: React.Dispatch<React.SetStateAction<boolean>>
	settingUp2FA: boolean,
	setSettingUp2FA: React.Dispatch<React.SetStateAction<boolean>>
	selectedAccount: PlayerType | undefined;
}

function ShowInfo( {editProfile, setEditProfile, settingUp2FA, setSettingUp2FA, selectedAccount}: ShowInfoProps )
{
	const { loggedInAccounts, setTriggerFetchAccounts, setLoggedInAccounts }  = useAccountContext();

	const [formData, setFormData] = useState({username: '', email: '', password: '', confirmPassword: ''});
	const [emptyForm, setEmptyForm] = useState(true);
	const [confirmDisable2Fa, setConfirmDisable2Fa] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editPassword, setEditPassword] = useState(false);
	const [validation, setValidation] = useState(
	{
		'Already logged in': false,
		'Username exists': false,
		'Email exists': false,
		'Password don\'t matches': false,
		'Password matches!': false
	});
	const navigate = useNavigate();

	useEffect(() =>
	{
		if (selectedAccount)
			setFormData({ username: selectedAccount.username, email: selectedAccount.email, password: '', confirmPassword: ''});
	}, [selectedAccount]);

	useEffect(() =>
	{
		let passwordDontMatch = false;
		if (editPassword && (formData.password && formData.confirmPassword))
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
			'Already logged in': ((loggedInAccounts.some(player => player.username === formData.username) && selectedAccount?.username !== formData.username ) || (loggedInAccounts.some(player => player.email === formData.email) && selectedAccount?.email !== formData.email)),
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
  
		const hasChanges = editPassword ? (formData.username !== selectedAccount?.username 
		|| formData.email !== selectedAccount?.email || (formData.password && formData.password !== ""))
		: (formData.username !== selectedAccount?.username
		|| formData.email !== selectedAccount?.email);

  		setEmptyForm(isEmptyForm || !hasChanges);
	}, [formData, editPassword]);

	const disable2FA = async () =>
	{
		try
		{
			const response = await axios.post(`http://${window.location.hostname}:5001/api/auth/delete-totp`,
			{
				username: selectedAccount?.username
			});
			if (response.data.success)
			{
				const updatedLoggedInAccounts = loggedInAccounts.map((account) =>
				account.username === selectedAccount?.username ?
				{ 
					...account, 
					twofa: response.data.user.twofa 
				} : account);
				setLoggedInAccounts(updatedLoggedInAccounts);
				localStorage.setItem('loggedInAccounts', JSON.stringify(updatedLoggedInAccounts));
				setTriggerFetchAccounts(true);
			}
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
		setConfirmDisable2Fa(false);
		setFormData( prev => (
		{
			...prev,
			username: selectedAccount?.username,
			email: selectedAccount?.email,
			password: '',
			confirmPassword: ''
		}))
	};

	const deleteAccount = async () =>
	{
		try
		{
			const response = await axios.post('http://localhost:5001/api/delete-account',
			{
				username: selectedAccount?.username
			});
			if (response.data.success)
			{
				const updatedaccounts = loggedInAccounts.filter((player, index) => player.username !== selectedAccount?.username)
				setLoggedInAccounts(updatedaccounts);
				localStorage.setItem('loggedInAccounts', JSON.stringify(updatedaccounts));
				setTriggerFetchAccounts(true);
				navigate('/');
			}
		}
		catch (error)
		{
			console.error('Error deleting account:', error);
		}
	}

	return (
		<div className="flex flex-col w-full text-left space-y-4 items-center">
			{ editProfile &&
			(
			<div className="w-full flex text-xs justify-between whitespace-nowrap gap-2">
				{!confirmDelete &&
				(
					<button className="absolute items-center top-4 left-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => setConfirmDelete(true)}><MdOutlineDeleteForever size={24} />
					</button>	
				)}
				{confirmDelete ?
				(
					<>
					<motion.button className={`w-full bg-[#ff914d] hover:bg-[#ab5a28] hover:cursor-pointer text-white py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
						whileHover={{ scale: 1.03 }}
						whileTap={{scale: 0.97 }}
						onClick={() => {setConfirmDelete(false)}}>Cancel 
					</motion.button>
					<motion.button className={`w-full bg-red-900 hover:bg-red-700 hover:cursor-pointer text-white py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
						whileHover={{ scale: 1.03 }}
						whileTap={{scale: 0.97 }}
						onClick={() => {deleteAccount()}}>Delete account
					</motion.button>
					</>
				) : 
				(
					<>
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
								const response = await axios.post(`http://${window.location.hostname}:5001/api/update-account`,
								{
									prev_username: selectedAccount?.username,
									username: formData.username, 
									email: formData.email, 
									password: formData.password
								})
								if (response.data.success)
								{
									const updatedloggedInAccounts = loggedInAccounts.map((account) =>
									account.username === selectedAccount?.username
										? { 
											...account, 
											username: response.data.user.username,
											email: response.data.user.email 
										}
										: account
									);
									setLoggedInAccounts(updatedloggedInAccounts);
									localStorage.setItem('loggedInAccounts', JSON.stringify(updatedloggedInAccounts));
									setEditProfile(false);
									setEditPassword(false);
									navigate(`/playerinfo/${response.data.user.username}`);
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
						whileHover={{ scale: 1.03 }}
						whileTap={{scale: 0.97 }}
						onClick={() => {cancelEdit()}}>Cancel
					</motion.button>
					</>
				)}
			</div>
			)}
			{!confirmDelete &&
			(
			<>
			<div className="w-full">
				<div className="flex items-end justify-between gap-2">
					<p className="block text-sm font-medium mb-1">Username</p>
				</div>
				{editProfile ? <InputField name={"username"} value={formData.username} validation={validation} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/> :
					<div className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p>{selectedAccount?.username}</p>
					</div>}
			</div>
			<div className="w-full">
				<div className="flex items-end justify-between gap-2">
					<p className="block text-sm font-medium mb-1">Email</p>
				</div>
				{editProfile ? <InputField name={"email"} value={formData.email} validation={validation} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/> :
					<div className=" w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p className="">{selectedAccount?.email}</p>
					</div>}
			</div>
			<div className="w-full">
				<div className="flex items-end justify-between gap-2">
					<p className="block text-sm font-medium mb-1">Password</p>
				</div>
				{editPassword ? <InputField name={"password"} placeholder="Choose a new password" validation={validation} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} isPasswordField={true}/> :
					<div className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p>{('').padStart(10, '*')}</p>
						{editProfile && <EditIcon onClick={() => setEditPassword(true)} keyName="edit-password"/>}
					</div>}
			</div>
			{editPassword &&
			(
				<div className="w-full">
					<p className="block text-sm font-medium mb-1">Confirm Password</p>
					<InputField name={"confirmPassword"} placeholder="Confirm your new password" validation={validation} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} isPasswordField={true}/>
				</div>
			)}
			<div className="w-full">
				<div className="flex items-end justify-between gap-2">
					<p className="block text-sm font-medium mb-1">2FA</p>
				</div>
			{!settingUp2FA && 
			(
					<div className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
						<p>{selectedAccount?.twofa ? 'Yes' : 'No'}</p>
						{ editProfile && <EditIcon onClick={() => {!selectedAccount?.twofa ? setSettingUp2FA(true) : setConfirmDisable2Fa(true)}} keyName="edit-2fa"/>}
					</div>
			)}
			{settingUp2FA && editProfile && <Enable2FA setSettingUp2FA={setSettingUp2FA} selectedAccount={selectedAccount}/>}
				</div>
			{confirmDisable2Fa &&
			(
				<motion.button className={`w-full bg-red-900 hover:bg-red-700 hover:cursor-pointer text-white text-xs py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
					whileHover={{ scale: 1.03 }}
					whileTap={{scale: 0.97 }}
					onClick={() => {disable2FA(); setConfirmDisable2Fa(false)}}>Confirm disable 2FA
				</motion.button>
			)}
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
			</>
			)}
		</div>
	);
}

function PlayerInfo()
{
	const { loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts }  = useAccountContext();

	const [editProfile, setEditProfile] = useState(false);
	const [settingUp2FA, setSettingUp2FA] = useState(false);
	const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
	const [showCropper, setShowCropper] = useState(false);

	const [selectedAccount, setSelectedAccount] = useState<PlayerType>();
	const navigate = useNavigate();
	const { username } = useParams();

	useEffect(() =>
	{
		async function getAccount()
		{
			try
			{
				const response = await axios.get(`http://${window.location.hostname}:5001/api/get-account`,
					{ params: { requestedUser: username, username: username }})
				if (response.data.success)
					setSelectedAccount(response.data.user);
			}
			catch (error: any)
			{
				console.log(error.response)
			}
		}; getAccount()
	}, [editProfile])

	function handleProfileImageUpload(e: React.ChangeEvent<HTMLInputElement>)
	{
		const file = e.target.files?.[0];
		if (file)
		{
			// Lees de afbeelding als DataURL
			const reader = new FileReader();
			reader.onload = (event) =>
			{
				if (event.target && typeof event.target.result === 'string')
				{
					// Sla de afbeelding tijdelijk op en toon de cropper
					setTempImageUrl(event.target.result);
					setShowCropper(true);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	async function handleCropComplete(croppedImage: string)
	{
		const res = await fetch(croppedImage);
		const blob = await res.blob();
		const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

		const formData = new FormData();
		formData.append('image', file);
		if (selectedAccount)
			formData.append('username', selectedAccount?.username)
		try
		{
			const response = await axios.post(`http://${window.location.hostname}:5001/api/upload`, formData,
			{
				headers:
				{
					'Accept': 'application/json' // géén Content-Type hier!
				}
			})
			if (response.data.success)
			{
				const updatedloggedInAccounts = loggedInAccounts.map((account) =>
				account.username === selectedAccount?.username ?
				{ 
					...account, 
					avatar: response.data.imageUrl,
				} : account);
				setLoggedInAccounts(updatedloggedInAccounts);
				localStorage.setItem('loggedInAccounts', JSON.stringify(updatedloggedInAccounts));
				setTriggerFetchAccounts(true);
				setSelectedAccount(prev => ({...prev!, avatar: response.data.imageUrl}));
			}
		}
		catch (error: any)
		{
			console.log(error.response);
		}
		setShowCropper(false);
		setTempImageUrl(null);
	};

	function handleCropCancel()
	{ 
		setShowCropper(false); 
		setTempImageUrl(null);
	};


	async function logout()
	{
		try
		{
			await axios.post(`http://${window.location.hostname}:5001/api/logout`,
				{
					userId: selectedAccount?.id
				}
			)
			const updatedaccounts = loggedInAccounts.filter((account) => account.id !== selectedAccount?.id)
			setLoggedInAccounts(updatedaccounts);
			localStorage.setItem('loggedInAccounts', JSON.stringify(updatedaccounts));
			setTriggerFetchAccounts(false);
			navigate('/');
		}
		catch (error: any)
		{
			console.error("Error in logout");
		}
	}

	return (
		<AnimatePresence>
			<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
				<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-md h-auto max-h-[80vh] overflow-y-auto relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
					<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => {navigate('/'); setTriggerFetchAccounts(false)}}>
						<IoMdClose size={24} />
					</button>
					{!editProfile &&
					(
						<button className="absolute items-center top-4 left-4 text-gray-400 hover:text-white hover:cursor-pointer"
							onClick={() => {logout()}}>
							<BiLogOut size={24} />
						</button>
					)}
					<div className="flex w-full flex-col items-center gap-2">
						<h2 className="text-2xl font-bold text-center">{selectedAccount?.username}</h2>
						  <div className="relative">
							<img src={selectedAccount?.avatar !== '' ? selectedAccount?.avatar : Player} className="h-16 w-16 rounded-full object-cover shadow-lg"/>
							{selectedAccount?.avatar && <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black to-transparent opacity-70"></div>}
							{editProfile &&
							(
								<label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-[#2a2a2a] p-1 rounded-full cursor-pointer hover:bg-[#3a3a3a] transition-colors">
									<input className="hidden" id="profile-upload" type="file" accept="image/*" onChange={handleProfileImageUpload}/>
									<FiCamera size={16} className="text-[#ff914d]" />
								</label>
							)}
						</div>
						{showCropper && tempImageUrl &&
						(
							<ImageCropper imageUrl={tempImageUrl}
								handleCropComplete={handleCropComplete}
								handleCropCancel={handleCropCancel}/>
						)}
						{!editProfile &&
						(
							<div className="flex w-full justify-between">
								<div className="flex flex-col items-center">
									<motion.button className="items-center mt-1 text-[#ff914d] hover:text-[#ab5a28] cursor-pointer"
										key="edit-button" 
										whileHover={ {scale: 1.17}}
										whileTap={ {scale: 0.87}}
										onClick={() => setEditProfile(true)}><LiaUserEditSolid size={24} />
									</motion.button>
									<p className="font-thin text-xs opacity-40">Edit profile</p>
								</div>
								<div className="flex flex-col items-center">
									<motion.button className="items-center mt-1 text-[#ff914d] hover:text-[#ab5a28] cursor-pointer"
										key="stats-button" 
										whileHover={ {scale: 1.17}}
										whileTap={ {scale: 0.87}}
										onClick={() => navigate('./stats')}><IoIosStats size={24} />
									</motion.button>
									<p className="font-thin text-xs opacity-40">Show Stats</p>
								</div>
							</div>
						)}
					</div>
					<ShowInfo editProfile={editProfile} setEditProfile={setEditProfile} settingUp2FA={settingUp2FA} setSettingUp2FA={setSettingUp2FA} selectedAccount={selectedAccount}/>
					<Outlet />
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

export default PlayerInfo