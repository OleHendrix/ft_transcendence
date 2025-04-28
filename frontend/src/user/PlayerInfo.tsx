import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useAccountContext } from "../contexts/AccountContext";
import Player from "../../assets/Player.svg";
import { motion } from 'framer-motion';
import { BiLogOut } from "react-icons/bi";
import { MdOutlineDeleteForever } from "react-icons/md";
import { ImageCropper, CameraLabel } from "./ImageCropper";
import ModalWrapper from "../utils/ModalWrapper";
import { EditIcon, InputField, ProfileActionButton } from "./utilsComponents";
import axios from "axios";
import { PlayerType } from "../types";
import { Enable2FA, disable2FA } from "./2FA";
import { useGetAccount } from "./useGetAccount";
import CloseButton from "../utils/CloseButton";
import { deleteAccount, logout, updateAccount } from "./utilsFunctions";
import { defaultSignUpValidation, emptySignUpForm } from "../objects";

interface ShowInfoProps
{
	editProfile: boolean,
	setEditProfile: React.Dispatch<React.SetStateAction<boolean>>
	settingUp2FA: boolean,
	setSettingUp2FA: React.Dispatch<React.SetStateAction<boolean>>
	selectedAccount: PlayerType | undefined;
	setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
}

function ShowInfo( {editProfile, setEditProfile, settingUp2FA, setSettingUp2FA, selectedAccount, setSelectedAccount}: ShowInfoProps )
{
	const { loggedInAccounts, setTriggerFetchAccounts, setLoggedInAccounts }  = useAccountContext();

	const [formData, setFormData] = useState(emptySignUpForm);
	const [emptyForm, setEmptyForm] = useState(true);
	const [confirmDisable2Fa, setConfirmDisable2Fa] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editPassword, setEditPassword] = useState(false);
	const [validation, setValidation] = useState(defaultSignUpValidation);
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
			'Password does not match': passwordDontMatch,
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
						onClick={() => {deleteAccount({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}); navigate('/')}}>Delete account
					</motion.button>
					</>
				) : 
				(
					<>
					<motion.button className={`w-full shadow-2xl bg-[#ff914d]
					${(emptyForm || validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match']) ? 'opacity-30'
					: 'hover:bg-[#ab5a28] hover:cursor-pointer'} text-white py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
					disabled={(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match'])}
					whileHover={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match']) ? { scale: 1.03 } : {}}
					whileTap={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match']) ? { scale: 0.97 } : {}}
					onClick={() => {updateAccount({formData, loggedInAccounts, setLoggedInAccounts, selectedAccount, setEditProfile, setEditPassword, setTriggerFetchAccounts, navigate})}}>Save changes
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
			{settingUp2FA && editProfile && <Enable2FA loggedInAccounts={loggedInAccounts} setSettingUp2FA={setSettingUp2FA} selectedAccount={selectedAccount} setLoggedInAccounts={setLoggedInAccounts} setTriggerFetchAccounts={setTriggerFetchAccounts} setSelectedAccount={setSelectedAccount}/>}
				</div>
			{confirmDisable2Fa &&
			(
				<motion.button className={`w-full bg-red-900 hover:bg-red-700 hover:cursor-pointer text-white text-xs py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
					whileHover={{ scale: 1.03 }}
					whileTap={{scale: 0.97 }}
					onClick={() => {disable2FA({loggedInAccounts, selectedAccount, setLoggedInAccounts, setSelectedAccount, setTriggerFetchAccounts}); setConfirmDisable2Fa(false)}}>Confirm disable 2FA
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
	const [tempImageUrl, setTempImageUrl] = useState<string>('');
	const [showCropper, setShowCropper] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState<PlayerType>();
	const navigate = useNavigate();
	const { username } = useParams();

	useGetAccount({username, setSelectedAccount});

	return (
		<ModalWrapper>
			<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-md h-auto max-h-[80vh] overflow-y-auto relative shadow-2xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
				<CloseButton onClick={() => {navigate('/'); setTriggerFetchAccounts(false)}}/>
				{!editProfile &&
				(
					<button className="absolute items-center top-4 left-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => {logout({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}); navigate('/')}}>
						<BiLogOut size={24} />
					</button>
				)}
				<div className="flex w-full flex-col items-center gap-2">
					<h2 className="text-2xl font-bold text-center">{selectedAccount?.username}</h2>
						<div className="relative">
						<img src={selectedAccount?.avatar !== '' ? selectedAccount?.avatar : Player} className="h-16 w-16 rounded-full object-cover shadow-lg"/>
						{selectedAccount?.avatar && <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black to-transparent opacity-70"></div>}
						{editProfile && <CameraLabel setTempImageUrl={setTempImageUrl} setShowCropper={setShowCropper}/>}
					</div>
					{showCropper && tempImageUrl &&
					(
						<ImageCropper imageUrl={tempImageUrl}setTempImageUrl={setTempImageUrl}
							setShowCropper={setShowCropper} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount}/>
					)}
					{!editProfile &&
					(
						<div className="flex w-full justify-between">
							<ProfileActionButton keyword="edit" onClick={() => setEditProfile(true)}/>
							<ProfileActionButton keyword="stats" onClick={() => navigate('./stats')}/>
						</div>
					)}
				</div>
				<ShowInfo editProfile={editProfile} setEditProfile={setEditProfile} settingUp2FA={settingUp2FA} setSettingUp2FA={setSettingUp2FA} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount}/>
				<Outlet />
			</motion.div>
		</ModalWrapper>
	);
}

export default PlayerInfo